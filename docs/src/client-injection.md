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

By default, if the provided code **does not** start with a shebang (`#!`), the server executes it as a **Node.js ECMAScript Module** (`.mjs`). To ensure compatibility with v3 scripts, the following globals are automatically provided:

- `ROOT`: The absolute path to the course root.
- `join`: The `path.join` function from `node:path`.
- `__result`: A variable that, if assigned, will be printed to standard output at the end of execution.

Alternatively, you can provide an explicit shebang (e.g., `#!/bin/bash`) to execute the code using any available shell or interpreter.

### Response Data

The server returns a `RESPONSE` event with the following data:

- `stdout`: The standard output of the process.
- `stderr`: The standard error of the process.
- `exit_code`: The process exit code.
- `__result`: A trimmed version of `stdout` (useful for capturing the output of legacy scripts).

### Example

This enables scripts like the following to be run:

````admonish example collapsible=true title="client/injectable.js"
```js
function checkForToken() {
  const serverTokenCode = `
    try {
      const {readFile} = await import('fs/promises');
      const tokenFile = await readFile(join(ROOT, 'config/token.txt'));
      const token = tokenFile.toString();
      console.log(token);
      __result = token;
    } catch (e) {
      console.error(e);
      __result = null;
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
    const serverTokenCode = `
      try {
        const {writeFile} = await import('fs/promises');
        await writeFile(join(ROOT, 'config/token.txt'), '${token}');
        __result = true;
      } catch (e) {
        console.error(e);
        __result = false;
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
  }`
);

window.onload = function () {
  socket.onmessage = function (event) {
    const parsedData = JSON.parse(event.data);
    if (
      parsedData.event === 'RESPONSE' &&
      parsedData.data.event === '__run-client-code'
    ) {
      if (parsedData.data.error) {
        console.log(parsedData.data.error);
        return;
      }
      const { __result } = parsedData.data;
      if (!__result) {
        askForToken();
        return;
      }
      window.__token = __result;
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

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'token-input';
  input.style.color = 'black';
  const button = document.createElement('button');
  button.innerText = 'Submit';
  button.style.color = 'black';
  button.onclick = async () => {
    const token = input.value;
    const serverTokenCode = `
      try {
        const {writeFile} = await import('fs/promises');
        await writeFile(join(ROOT, 'config/token.txt'), '${token}');
        __result = true;
      } catch (e) {
        console.error(e);
        __result = false;
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
  }`
);

window.onload = function () {
  socket.onmessage = function (event) {
    const parsedData = JSON.parse(event.data);
    if (
      parsedData.event === 'RESPONSE' &&
      parsedData.data.event === '__run-client-code'
    ) {
      if (parsedData.data.error) {
        console.log(parsedData.data.error);
        return;
      }
      const { __result } = parsedData.data;
      if (!__result) {
        askForToken();
        return;
      }
      window.__token = __result;
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
