import { resolve } from 'node:path';

import { runBrowserCoverage } from './browser-coverage.mjs';
import { startBrowserHarness } from './browser-harness.mjs';
import { runLaunchpadE2E } from './launchpad.e2e.mjs';
import { runSurfaceSmoke } from './surfaces.smoke.mjs';

const root = resolve(new URL('../../', import.meta.url).pathname);
const configuredCdpPort = Number.parseInt(process.env.CDP_PORT ?? '', 10);
const harness = await startBrowserHarness({
  root,
  ...(Number.isInteger(configuredCdpPort) && configuredCdpPort > 0 ? { cdpPort: configuredCdpPort } : {}),
});

try {
  console.log('Browser suite: Launchpad E2E');
  await runLaunchpadE2E(harness);
  await harness.resetContext();
  console.log('Browser suite: client coverage');
  await runBrowserCoverage(harness);
  await harness.resetContext();
  console.log('Browser suite: cross-surface smoke');
  await runSurfaceSmoke(harness);
  console.log('Browser suite passed with one managed Chrome instance.');
} finally {
  await harness.close();
}
