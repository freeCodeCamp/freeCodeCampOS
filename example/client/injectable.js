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
