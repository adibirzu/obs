import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';

import { parseDevToolsActivePort } from './browser-harness-protocol.mjs';

export { parseDevToolsActivePort } from './browser-harness-protocol.mjs';

const STARTUP_ATTEMPTS = 2;
const DEVTOOLS_FILE_ATTEMPTS = 120;
const ENDPOINT_ATTEMPTS = 50;
const HANDSHAKE_DELAY_MS = 100;
const SHUTDOWN_TIMEOUT_MS = 4_000;

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'], ['.drawio', 'application/xml'], ['.excalidraw', 'application/json'],
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'], ['.svg', 'image/svg+xml'],
]);

async function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].filter(Boolean);
  for (const candidate of candidates) {
    try { await access(candidate); return candidate; } catch { /* try the next candidate */ }
  }
  throw new Error('Chrome not found. Set CHROME_PATH to run browser smoke tests.');
}

function startServer({ root, host, port }) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
      const relativePath = pathname === '/' ? '/index.html' : pathname;
      const filePath = resolve(root, `.${relativePath}`);
      if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) throw new Error('Invalid path');
      if (!(await stat(filePath)).isFile()) throw new Error('Not a file');
      response.writeHead(200, { 'Content-Type': mimeTypes.get(extname(filePath)) || 'application/octet-stream' });
      response.end(await readFile(filePath));
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });
  return new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolvePromise({ server, port: server.address().port }));
  });
}

const delay = milliseconds => new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));

async function retry(label, action, { attempts, delayMs = HANDSHAKE_DELAY_MS, shouldAbort } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (shouldAbort?.()) throw new Error(`${label}: Chrome exited before the handshake completed`);
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await delay(delayMs);
    }
  }
  throw new Error(`${label} failed after ${attempts} attempts: ${lastError?.message || 'unknown error'}`);
}

async function waitForDevToolsPort(profile, chrome) {
  const activePortFile = join(profile, 'DevToolsActivePort');
  return retry('DevToolsActivePort handshake', async () =>
    parseDevToolsActivePort(await readFile(activePortFile, 'utf8')), {
    attempts: DEVTOOLS_FILE_ATTEMPTS,
    shouldAbort: () => hasProcessExited(chrome),
  });
}

async function waitForJson(url, attempts = ENDPOINT_ATTEMPTS) {
  return retry(`DevTools endpoint ${url}`, async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const targets = await response.json();
    if (!Array.isArray(targets) || !targets.some(entry => entry.type === 'page')) throw new Error('page target not ready');
    return targets;
  }, { attempts });
}

function diagnosticTail(chunks, maximumLines = 8) {
  return chunks.join('').trim().split(/\r?\n/).filter(Boolean).slice(-maximumLines).join('\n');
}

function hasProcessExited(child) {
  return !child || child.exitCode !== null || child.signalCode !== null;
}

async function waitForProcessExit(child, timeoutMs = SHUTDOWN_TIMEOUT_MS) {
  if (hasProcessExited(child)) return true;
  return new Promise(resolvePromise => {
    const timeout = setTimeout(() => {
      child.removeListener('exit', onExit);
      resolvePromise(false);
    }, timeoutMs);
    const onExit = () => {
      clearTimeout(timeout);
      resolvePromise(true);
    };
    child.once('exit', onExit);
    if (hasProcessExited(child)) onExit();
  });
}

async function terminateProcess(child) {
  if (hasProcessExited(child)) return;
  signalProcess(child, 'SIGTERM');
  if (await waitForProcessExit(child)) return;
  signalProcess(child, 'SIGKILL');
  if (!await waitForProcessExit(child)) throw new Error(`Chrome process ${child.pid} did not exit after SIGKILL`);
}

function signalProcess(child, signal) {
  try {
    process.kill(-child.pid, signal);
  } catch {
    child.kill(signal);
  }
}

async function closeServer(server) {
  if (!server?.listening) return;
  await new Promise((resolvePromise, reject) => server.close(error => error ? reject(error) : resolvePromise()));
}

async function launchOwnedChrome(chromePath, host) {
  const failures = [];
  for (let attempt = 1; attempt <= STARTUP_ATTEMPTS; attempt += 1) {
    const profile = await mkdtemp(join(tmpdir(), 'obs-surfaces-smoke-'));
    const startupErrors = [];
    const chrome = spawn(chromePath, [
      '--headless', '--disable-background-networking', '--disable-default-apps', '--disable-extensions',
      '--disable-breakpad', '--disable-crash-reporter', '--enable-logging=stderr',
      '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
    ], { detached: true, stdio: ['ignore', 'ignore', 'pipe'] });
    chrome.stderr.on('data', chunk => startupErrors.push(String(chunk)));
    chrome.once('error', error => startupErrors.push(`process error: ${error.message}`));
    chrome.once('exit', (code, signal) => startupErrors.push(`process exit: code=${code ?? 'none'} signal=${signal ?? 'none'}`));
    try {
      const debugPort = await waitForDevToolsPort(profile, chrome);
      const targets = await waitForJson(`http://${host}:${debugPort}/json/list`);
      return { chrome, debugPort, profile, targets, diagnostics: startupErrors };
    } catch (error) {
      const detail = diagnosticTail(startupErrors);
      const failure = `attempt ${attempt}: ${error.message}${detail ? `\n${detail}` : ''}`;
      failures.push(failure);
      console.error(`Smoke harness: Chrome startup ${failure}`);
      await terminateProcess(chrome).catch(shutdownError => failures.push(`attempt ${attempt} shutdown: ${shutdownError.message}`));
      await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  }
  throw new Error(`Chrome startup failed after ${STARTUP_ATTEMPTS} attempts\nChrome diagnostics:\n${failures.join('\n')}`);
}

export async function startBrowserHarness({ root, port = 0, cdpPort = 0 }) {
  const host = '127.0.0.1';
  console.log('Smoke harness: locating Chrome');
  const chromePath = await findChrome();
  const startedServer = await startServer({ root, host, port });
  const { server, port: serverPort } = startedServer;
  console.log(`Smoke harness: started static server on ${host}:${serverPort}`);
  let chrome = null;
  let profile = null;
  let ownsChrome = false;
  const startupErrors = [];
  let debugPort;
  let targets;
  try {
    if (cdpPort) {
      try {
        debugPort = cdpPort;
        targets = await waitForJson(`http://${host}:${debugPort}/json/list`, 5);
        console.log(`Smoke harness: reusing Chrome on debug port ${debugPort}`);
      } catch { /* launch an isolated browser below */ }
    }
    if (!targets) {
      console.log('Smoke harness: starting Chrome with an automatically allocated debug port');
      const launched = await launchOwnedChrome(chromePath, host);
      ({ chrome, debugPort, profile, targets } = launched);
      startupErrors.push(...launched.diagnostics);
      ownsChrome = true;
      console.log(`Smoke harness: Chrome published debug port ${debugPort}`);
    }
  } catch (error) {
    await terminateProcess(chrome).catch(() => {});
    await closeServer(server);
    if (profile) await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    const detail = diagnosticTail(startupErrors);
    throw new Error(`${error.message}${detail ? `\nChrome diagnostics:\n${detail}` : ''}`);
  }
  const target = targets.find(entry => entry.type === 'page');
  assert.ok(target?.webSocketDebuggerUrl, 'Chrome exposes a page target');
  console.log('Smoke harness: connecting to Chrome');
  let socket;
  try {
    socket = await retry('DevTools WebSocket handshake', () => new Promise((resolvePromise, reject) => {
      const candidate = new WebSocket(target.webSocketDebuggerUrl);
      const timeout = setTimeout(() => {
        candidate.close();
        reject(new Error('WebSocket open timed out'));
      }, 2_000);
      candidate.addEventListener('open', () => {
        clearTimeout(timeout);
        resolvePromise(candidate);
      }, { once: true });
      candidate.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      }, { once: true });
    }), { attempts: 3, delayMs: 100 });
  } catch (error) {
    await terminateProcess(ownsChrome ? chrome : null).catch(() => {});
    await closeServer(server);
    if (profile) await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    const detail = diagnosticTail(startupErrors);
    throw new Error(`${error.message}${detail ? `\nChrome diagnostics:\n${detail}` : ''}`);
  }

  let requestId = 0;
  const pending = new Map();
  const eventWaiters = new Map();
  const requestUrls = new Map();
  const exceptions = [];
  const localNetworkFailures = [];
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
    if (message.method === 'Network.requestWillBeSent') requestUrls.set(message.params.requestId, message.params.request.url);
    if (message.method === 'Network.loadingFailed') {
      const url = requestUrls.get(message.params.requestId) ?? '';
      if (url.startsWith(`http://${host}:${serverPort}/`)) localNetworkFailures.push(`${url}: ${message.params.errorText}`);
    }
    const queue = eventWaiters.get(message.method);
    if (queue?.length) queue.shift()(message.params);
  });

  const send = (method, params = {}) => {
    const id = ++requestId;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolvePromise, reject) => pending.set(id, { resolve: resolvePromise, reject }));
  };
  const once = method => new Promise(resolvePromise => eventWaiters.set(method, [...(eventWaiters.get(method) || []), resolvePromise]));
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const navigate = async path => {
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: `http://${host}:${serverPort}/${path}` });
    await loaded;
  };
  const reload = async () => {
    const loaded = once('Page.loadEventFired');
    await send('Page.reload', { ignoreCache: true });
    await loaded;
  };
  const waitFor = async (expression, timeoutMs = 5000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return;
      await new Promise(resolvePromise => setTimeout(resolvePromise, 50));
    }
    throw new Error(`Timed out waiting for: ${expression}`);
  };
  const setViewport = ({ width, height }) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  const setReducedMotion = value => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] });
  const press = async (key, code, keyCode) => {
    const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined;
    await send('Input.dispatchKeyEvent', {
      type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode,
      ...(text ? { text, unmodifiedText: text } : {}),
    });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode });
  };
  const startCoverage = async () => {
    await send('Profiler.enable');
    await send('Profiler.startPreciseCoverage', { callCount: true, detailed: true, allowTriggeredUpdates: false });
  };
  const takeCoverage = async () => (await send('Profiler.takePreciseCoverage')).result;
  const stopCoverage = async () => {
    const result = await takeCoverage();
    await send('Profiler.stopPreciseCoverage');
    await send('Profiler.disable');
    return result;
  };
  const closeSocket = async () => {
    if (socket.readyState === WebSocket.CLOSED) return;
    const closed = new Promise(resolvePromise => socket.addEventListener('close', resolvePromise, { once: true }));
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close();
    await Promise.race([closed, delay(1_000)]);
  };
  let closePromise;
  const close = () => {
    if (closePromise) return closePromise;
    closePromise = (async () => {
      const cleanupErrors = [];
      if (ownsChrome && !hasProcessExited(chrome)) {
        try {
          try { await Promise.race([send('Browser.close'), delay(1_000)]); } catch { /* fall back to process signals */ }
          if (!await waitForProcessExit(chrome, 2_000)) await terminateProcess(chrome);
          await delay(1_500);
        } catch (error) {
          cleanupErrors.push(`Chrome shutdown: ${error.message}`);
        }
      }
      try { await closeSocket(); } catch (error) { cleanupErrors.push(`WebSocket shutdown: ${error.message}`); }
      try { await closeServer(server); } catch (error) { cleanupErrors.push(`server shutdown: ${error.message}`); }
      if (profile) {
        try { await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
        catch (error) { cleanupErrors.push(`profile cleanup: ${error.message}`); }
      }
      if (cleanupErrors.length) throw new Error(`Browser harness cleanup failed:\n${cleanupErrors.join('\n')}`);
    })();
    return closePromise;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  return {
    close, evaluate, exceptions, localNetworkFailures, navigate, press, reload, send, setReducedMotion,
    setViewport, startCoverage, stopCoverage, takeCoverage, waitFor,
    baseUrl: `http://${host}:${serverPort}`,
  };
}
