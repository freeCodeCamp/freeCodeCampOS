# Client Injection

With the [`static` config](./configuration.md#client) option, you can add a `/script/injectable.js` script to be injected in the `head` of the client.

````admonish example
```json
{
  "client": {
    "static": {
      "/script/injectable.js": "./client/injectable.js"
    }
  }
}
```
````

There is a reserved websocket event (`__run-client-code`) that can be used to send code from the client to the server to be run in the server's context. The code has access to a few globals:

- `ROOT`: The root of the course
- `join`: The Node.js `path` module function

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
