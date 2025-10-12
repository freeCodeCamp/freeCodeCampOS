# Test Utilities <!-- omit in toc -->

The test utilities are exported/global objects available in the test runner. These are referred to as _"helpers"_, and the included helpers are exported from [https://github.com/freeCodeCamp/freeCodeCampOS/blob/main/.freeCodeCamp/tooling/test-utils.js](https://github.com/freeCodeCamp/freeCodeCampOS/blob/main/.freeCodeCamp/tooling/test-utils.js).

Many of the exported functions are _convinience wrappers_ around Nodejs' `fs` and `child_process` modules. Specifically, they make use of the global `ROOT` variable to run the functions relative to the root of the workspace.

- [`controlWrapper`](#controlwrapper)
- [`getBashHistory`](#getbashhistory)
- [`getCommandOutput`](#getcommandoutput)
- [`getCWD`](#getcwd)
- [`getLastCommand`](#getlastcommand)
- [`getLastCWD`](#getlastcwd)
- [`getScriptIn`](#getscriptin)
- [`getScriptOut`](#getscriptout)
- [`getTemp`](#gettemp)
- [`getTerminalOutput`](#getterminaloutput)
- [`importSansCache`](#importsanscache)

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
const result = await __helpers.controlWrapper(cb);
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
const bashHistory = await __helpers.getBashHistory();
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
const { stdout, stderr } = await __helpers.getCommandOutput('ls');
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
const cwd = await __helpers.getCWD();
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
const lastCommand = await __helpers.getLastCommand();
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
const lastCWD = await __helpers.getLastCWD();
```

## `getScriptIn`

Get the `.logs/.script_in.log` file contents.

```admonish danger title="Safety"
Throws if file does not exist, or if read permission is denied.
```

```typescript
function getScriptIn(): Promise<string>;
```

```javascript
const scriptIn = await __helpers.getScriptIn();
```

```admonish note
The output does not include _untyped_ characters. That is, if tab completion is used, the output will not include the final command, but only up to the point of completion.
```

## `getScriptOut`

Get the `.logs/.script_out.log` file contents.

```admonish danger title="Safety"
Throws if file does not exist, or if read permission is denied.
```

```typescript
function getScriptOut(): Promise<string>;
```

```javascript
const scriptOut = await __helpers.getScriptOut();
```

```admonish note
Use the output of the `.script_out.log` file at your own risk. This file is raw input from the terminal including ANSI escape codes.
```

TODO: use `--log-in` to "watch" `--log-out`. When `--log-in` changes, read from `--log-out`.

## `getTemp`

```admonish warning title="<code>3.6.0</code>"
Deprecated in favour of [`getScriptOut`](#getscriptout).
```

Get the `.logs/.temp.log` file contents.

```admonish danger title="Safety"
Throws if file does not exist, or if read permission is denied.
```

```typescript
function getTemp(): Promise<string>;
```

```javascript
const temp = await __helpers.getTemp();
```

```admonish note
Use the output of the `.temp.log` file at your own risk. This file is raw input from the terminal including ANSI escape codes.

Output varies depending on emulator, terminal size, order text is typed, etc. For more info, see [https://github.com/freeCodeCamp/solana-curriculum/issues/159](https://github.com/freeCodeCamp/solana-curriculum/issues/159)
```

## `getTerminalOutput`

```admonish warning title="<code>3.6.0</code>"
Deprecated in favour of [`getScriptOut`](#getscriptout)

```

Get the `.logs/.terminal_out.log` file contents.

```admonish danger title="Safety"
Throws if file does not exist, or if read permission is denied.
```

```typescript
function getTerminalOutput(): Promise<string>;
```

```javascript
const terminalOutput = await __helpers.getTerminalOutput();
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
const { exportedFile } = await __helpers.importSansCache(
  'learn-x-by-building-y/index.js'
);
```
