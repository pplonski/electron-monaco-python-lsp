/* eslint-disable no-console */
const express = require('express');
const ws = require('ws');
const url = require('url');
const { launch } = require('./json-server-launcher');

const PORT = 8999;
const SOCKETPATH = '/index.html/monacoServer';

const app = express();

const wss = new ws.Server({
  noServer: true,
  perMessageDeflate: false,
});

const server = app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  console.log('server on upgrade');
  const pathname = request.url ? url.parse(request.url).pathname : undefined;
  console.log({ pathname });
  if (pathname === SOCKETPATH) {
    wss.handleUpgrade(request, socket, head, (webSocket) => {
      const socket2 = {
        send: (content) =>
          webSocket.send(content, (error) => {
            if (error) {
              throw error;
            }
          }),
        onMessage: (cb) => webSocket.on('message', cb),
        onError: (cb) => webSocket.on('error', cb),
        onClose: (cb) => webSocket.on('close', cb),
        dispose: () => webSocket.close(),
      };
      console.log({ state: webSocket.readyState, open: webSocket.OPEN });
      // launch the server when the web socket is opened
      if (webSocket.readyState === webSocket.OPEN) {
        launch(socket2);
      } else {
        webSocket.on('open', () => launch(socket));
      }
    });
  }
});
