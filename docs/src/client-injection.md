# Client Injection

With the [`static_paths` config](./configuration.md#client) option, you can add a `/script/injectable.js` script to be injected in the `head` of the client.

````admonish example
```json
{
  "client": {
    "static_paths": {
      "/script/injectable.js": "./client/injectable.js"
    }
  }
}
```
````

There is a reserved websocket event (`__run-client-code`) that can be used to send code from the client to the server to be executed. 

### Execution Environment

The provided code **must** start with a valid shebang (e.g., `#!/usr/bin/env node` or `#!/bin/bash`). The server writes the code to a temporary file, sets executable permissions (on Unix), and executes it directly.

**No globals or automatic imports are provided.** You are responsible for importing any necessary modules and defining the environment within your script.

### Response Data

The server returns a `RESPONSE` event with the following data:

- `stdout`: The standard output of the process.
- `stderr`: The standard error of the process.
- `exit_code`: The process exit code.

### Example

This enables scripts like the following to be run:

````admonish example collapsible=true title="client/injectable.js"
```js
function checkForToken() {
  const serverTokenCode = `#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const ROOT = process.cwd();

try {
  const tokenFile = await readFile(join(ROOT, 'config/token.txt'));
  const token = tokenFile.toString();
  console.log(token);
} catch (e) {
  process.exit(1);
}`;
  socket.send(
    JSON.stringify({
      event: '__run-client-code',
      data: serverTokenCode
    })
  );
}

async function askForToken() {
  const modal = document.createElement('dialog');
  const p = document.createElement('p');
  p.innerText = 'Enter your token';
  p.style.color = 'black';
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'token-input';
  input.style.color = 'black';
  const button = document.createElement('button');
  button.innerText = 'Submit';
  button.style.color = 'black';
  button.onclick = async () => {
    const token = input.value;
    const serverTokenCode = `#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const ROOT = process.cwd();

try {
  await writeFile(join(ROOT, 'config/token.txt'), '${token}');
  process.exit(0);
} catch (e) {
  process.exit(1);
}`;
    socket.send(
      JSON.stringify({
        event: '__run-client-code',
        data: serverTokenCode
      })
    );
    modal.close();
  };

  modal.appendChild(p);
  modal.appendChild(input);
  modal.appendChild(button);
  document.body.appendChild(modal);
  modal.showModal();
}

const socket = new WebSocket(
  `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
    window.location.host
  }/ws`
);

window.onload = function () {
  socket.onmessage = function (event) {
    const parsedData = JSON.parse(event.data);
    if (
      parsedData.event === 'RESPONSE' &&
      parsedData.data.event === '__run-client-code'
    ) {
      if (parsedData.data.error) {
        console.error(parsedData.data.error);
        return;
      }
      
      const { stdout, exit_code } = parsedData.data;
      if (exit_code !== 0 || !stdout.trim()) {
        askForToken();
        return;
      }
      window.__token = stdout.trim();
    }
  };
  let interval;
  interval = setInterval(() => {
    if (socket.readyState === 1) {
      clearInterval(interval);
      checkForToken();
    }
  }, 1000);
};
```
````
