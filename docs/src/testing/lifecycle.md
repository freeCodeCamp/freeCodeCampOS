# Lifecycle

The lifecycle of the testing system follows:

1. Server parses test from curriculum Markdown file
2. Server evaluates any `--before-all--` ops

- If any `--before-all--` ops fail, an error is printed to the console
- If any `--before-all--` ops fail, the tests stop running

3. Server evaluates all tests in parallel[^1]
   1. Server evaluates any `--before-each--` ops
      1. If any `--before-each--` ops fail, test code is not run
   2. Server evaluates the test
   3. Server evaluates any `--after-each--` ops
4. Server evaluates any `--after-all--` ops

- If any `--after-all--` ops fail, an error is printed to the console

[^1]: Tests can be configured to run in order, in a blocking fashion with the `blockingTests` configuration option.
