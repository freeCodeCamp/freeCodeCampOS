# Runner

## Requirements

- Tests with different runners may not depend on one another
  - Runners are grouped by type, and run together

## API

A test outputs:

```json
{
  "id": <id>,
  "error": null | "<error>"
}
```

The binary outputs all successful runs to `stdout`. `stderr` is used for bad inputs, and anything preventing the runner from being called.

`stdout` either consists of a JSON-serializable test output:

```json
{
  "id": <id>,
  "test_state": {
    "kind": "passed" | "failed" | "cancelled" | "neutral",
    "message": "<failed_error>"
  }
}
```

Or, the output from the process `stdout`/`stderr`:

```bash
<stdout / stderr>
```
