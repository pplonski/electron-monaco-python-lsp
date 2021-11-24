/* eslint-disable no-console */
import * as rpc from '@codingame/monaco-jsonrpc';
import * as server from '@codingame/monaco-jsonrpc/lib/server';
import * as lsp from 'vscode-languageserver';

function launch(socket) {
  const reader = new rpc.WebSocketMessageReader(socket);
  const writer = new rpc.WebSocketMessageWriter(socket);
  console.log('connection established');
  const socketConnection = server.createConnection(reader, writer, () =>
    socket.dispose()
  );
  const serverConnection = server.createServerProcess(
    'JSON',
    '/home/piotr/sandbox/example/pyls/venv/bin/pylsp' // path to python-lsp-server called with pylsp command
  );
  server.forward(socketConnection, serverConnection, (message) => {
    // console.log('server forward');
    if (rpc.isRequestMessage(message)) {
      if (message.method === lsp.InitializeRequest.type.method) {
        const initializeParams = message.params;
        initializeParams.processId = process.pid;
      }
    }
    return message;
  });
}

module.exports = {
  launch,
};
