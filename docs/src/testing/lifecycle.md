# Lifecycle

The lifecycle of the testing system follows:

1. Server parses test from curriculum Markdown file
2. Server evaluates any `--before-all--` ops

- If any `--before-all--` ops fail, an error is printed to the console
- If any `--before-all--` ops fail, the tests **continue** to run

3. Server evaluates all tests asynchronously
4. Server evaluates any `--after-all--` ops

- If any `--after-all--` ops fail, an error is printed to the console
