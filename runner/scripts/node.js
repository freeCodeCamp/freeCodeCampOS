async function main() {
  try {
    // --runner-start-before_all--
    // --runner-end-before_all--
    //
    const settled = [];
    // --runner-start-tests--
    // --runner-end-tests--
    const prom = await Promise.allSettled(settled);
    prom.forEach((p, i) => {
      if (p.status === "rejected") {
        handle_error(p.reason, i);
      }
    });
    //
    // --runner-start-tests-break_on_failure--
    // --runner-end-tests-break_on_failure--
    //
    // --runner-start-tests-blocking_tests--
    // --runner-end-tests-blocking_tests--
    //
    // --runner-start-tests-break_on_failure-blocking_tests--
    // --runner-end-tests-break_on_failure-blocking_tests--
    //
    // --runner-start-after_all--
    // --runner-end-after_all--
    //
    // --runner-start-test_functions--
    // --runner-end-test_functions--
  } catch (e) {
    throw e;
  }
}

function handle_error(e, id) {
  const error = {
    error: {},
    id: id,
  };
  Object.getOwnPropertyNames(e).forEach((key) => {
    error.error[key] = e[key];
  });
  // Cannot pass `e` "as is", because classes cannot be passed between threads
  // TODO: Switch for `instanceof AssertionError`
  // error.type = e instanceof Error ? "Error" : "AssertionError";
  console.error(JSON.stringify(error));
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
