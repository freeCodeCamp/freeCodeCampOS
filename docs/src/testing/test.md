# Test

Tests are run in worker threads. For non-blocking tests, each test is run in its own worker[^1]. For blocking tests, all tests are run in the same worker - one after the other.

```admonish attention
The `--before-all--`, `--after-each`, and `--after-all--` context is only available in the main thread.
```

[^1]: The operating system decides how many threads may be concurrent.
