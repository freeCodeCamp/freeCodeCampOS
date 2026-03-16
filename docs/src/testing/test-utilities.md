# Test Utilities

The following built-in helpers are available directly in the test context. Many are convenience wrappers around Nodejs' `fs` and `child_process` modules, which make use of the global `ROOT` variable to run relative to the root of the workspace.

## `controlWrapper`

Wraps a function in an interval to retry until it does not throw or times out.

```typescript
function controlWrapper(
  cb: () => any,
  { timeout = 10_000, stepSize = 250 }
): Promise<ReturnType<cb> | null>;
```

```admonish attention title=""
The callback function must throw for the control wrapper to re-try.
```

```javascript
const cb = async () => {
  const flakyFetch = await fetch('http://localhost:3123');
  return flakyFetch.json();
};
const result = await controlWrapper(cb);
```

## `getBashHistory`

Get the `.logs/.bash_history.log` file contents

```admonish danger title="Safety"
Throws if file does not exist, or if read permission is denied.
```

```typescript
function getBashHistory(): Promise<string>;
```

```javascript
const bashHistory = await getBashHistory();
```

## `getCommandOutput`

Returns the output of a command called from the given path relative to the root of the workspace.

```admonish danger title="Safety"
Throws if path is not a valid POSIX/DOS path, and if promisified `exec` throws.
```

```typescript
function getCommandOutput(
  command: string,
  path = ''
): Promise<{ stdout: string; stderr: string } | Error>;
```

```javascript
const { stdout, stderr } = await getCommandOutput('ls');
```

## `getCWD`

Get the `.logs/.cwd.log` file contents

```admonish danger title="Safety"
Throws if file does not exist, or if read permission is denied.
```

```typescript
function getCWD(): Promise<string>;
```

```javascript
const cwd = await getCWD();
```

## `getLastCommand`

Get the \\(n^{th}\\) latest line from `.logs/.bash_history.log`.

```admonish danger title="Safety"
Throws if file does not exist, or if read permission is denied.
```

```typescript
function getLastCommand(n = 0): Promise<string>;
```

```javascript
const lastCommand = await getLastCommand();
```

## `getLastCWD`

Get the \\(n^{th}\\) latest line from `.logs/.cwd.log`.

```admonish danger title="Safety"
Throws if file does not exist, or if read permission is denied.
```

```typescript
function getLastCWD(n = 0): Promise<string>;
```

```javascript
const lastCWD = await getLastCWD();
```

## `getTemp`

Get the `.logs/.temp.log` file contents.

```admonish danger title="Safety"
Throws if file does not exist, or if read permission is denied.
```

```typescript
function getTemp(): Promise<string>;
```

```javascript
const temp = await getTemp();
```

```admonish note
Use the output of the `.temp.log` file at your own risk. This file is raw input from the terminal including ANSI escape codes.

Output varies depending on emulator, terminal size, order text is typed, etc. For more info, see [https://github.com/freeCodeCamp/solana-curriculum/issues/159](https://github.com/freeCodeCamp/solana-curriculum/issues/159)
```

## `getTerminalOutput`

Get the `.logs/.terminal_out.log` file contents.

```admonish danger title="Safety"
Throws if file does not exist, or if read permission is denied.
```

```typescript
function getTerminalOutput(): Promise<string>;
```

```javascript
const terminalOutput = await getTerminalOutput();
```

## `importSansCache`

Import a module side-stepping Nodejs' cache - cache-busting imports.

```admonish danger title="Safety"
Throws if path is not a valid POSIX/DOS path, and if the `import` throws.
```

```typescript
function importSansCache(path: string): Promise<any>;
```

```javascript
const { exportedFile } = await importSansCache(
  'learn-x-by-building-y/index.js'
);
```
