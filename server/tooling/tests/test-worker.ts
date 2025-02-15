import { parentPort, workerData } from "node:worker_threads";
// These are used in the local scope of the `eval` in `runTests`
// Dynamic imports must be used to prevent tree shaking.
const {
  assert,
  AssertionError,
  expect,
  config: chaiConfig,
} = await import("chai");
const { logger } = await import("../logger");

import __helpers_c from "../test-utils";

import { freeCodeCampConfig, ROOT } from "../env";
import { join } from "path";

let __helpers = __helpers_c;

// Update __helpers with dynamic utils:
const helpers = freeCodeCampConfig.tooling?.["helpers"];
if (helpers) {
  const dynamicHelpers = await import(join(ROOT, helpers));
  __helpers = { ...__helpers_c, ...dynamicHelpers };
}

const { beforeEach = "", project } = workerData;

parentPort?.on("message", async ({ testCode, testId }) => {
  let passed = false;
  let error: null | Record<string, unknown> = null;
  try {
    const _eval_out = await eval(`(async () => {
      ${beforeEach}
      ${testCode}
})();`);
    passed = true;
  } catch (e) {
    error = {};
    Object.getOwnPropertyNames(e).forEach((key) => {
      error![key] = e[key];
    });
    // Cannot pass `e` "as is", because classes cannot be passed between threads
    error.type = e instanceof AssertionError ? "AssertionError" : "Error";
  }
  parentPort?.postMessage({ passed, testId, error });
});
