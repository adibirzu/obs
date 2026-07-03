export function parseDevToolsActivePort(contents) {
  const [portLine] = String(contents).trim().split(/\r?\n/);
  const port = Number.parseInt(portLine, 10);
  if (!/^\d+$/.test(portLine || '') || port < 1 || port > 65_535) {
    throw new Error('DevToolsActivePort does not contain a valid TCP port');
  }
  return port;
}
