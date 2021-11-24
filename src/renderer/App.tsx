import React, { useEffect } from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';

import { listen } from '@codingame/monaco-jsonrpc';
import {
  MonacoLanguageClient,
  MonacoServices,
  CloseAction,
  ErrorAction,
  createConnection,
} from '@codingame/monaco-languageclient';
import * as monaco from 'monaco-editor';
import type * as monaco_core from 'monaco-editor-core';
import './App.css';
import { ModuleGraphConnection } from 'webpack';

const Hello = () => {
  function createLanguageClient(connection: any) {
    return new MonacoLanguageClient({
      name: 'Monaco language client',
      clientOptions: {
        documentSelector: ['python'],
        errorHandler: {
          error: () => ErrorAction.Continue,
          closed: () => CloseAction.DoNotRestart,
        },
      },
      connectionProvider: {
        get: (errorHandler, closeHandler) => {
          return Promise.resolve(
            createConnection(connection, errorHandler, closeHandler)
          );
        },
      },
    });
  }

  useEffect(() => {
    console.log('register python');

    monaco.languages.register({
      id: 'python',
      extensions: ['.py'],
      aliases: ['python'],
      mimetypes: ['application/text'],
    });

    monaco.editor.create(document.getElementById('container')!, {
      model: monaco.editor.createModel(
        ['import numpy', 'def func1():', '\tpass'].join('\n'),
        'python',
        monaco.Uri.parse('inmemory://model.py')
      ),
      theme: 'vs-dark',
    });

    monaco.editor.create(document.getElementById('container2')!, {
      model: monaco.editor.createModel(
        'func1()',
        'python',
        monaco.Uri.parse('inmemory://model2.py')
      ),
      theme: 'vs-dark',
    });

    // // install Monaco language client services
    MonacoServices.install(monaco as typeof monaco_core);

    // hardcoded socket URL
    const url = 'ws://localhost:8999/index.html/monacoServer';
    const webSocket = new WebSocket(url);

    // listen when the web socket is opened
    listen({
      webSocket,
      onConnection: (connection) => {
        // create and start the language client
        const languageClient = createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
      },
    });
  }, []);

  return (
    <div>
      <h1>
        electron-react-boilerplate + monaco-editor + monaco-languageclient +
        python-lsp-server
      </h1>

      <div style={{ border: 'solid 2px black' }}>
        <div id="container" style={{ height: '300px' }} />
      </div>
      <div style={{ border: 'solid 2px green' }}>
        <div id="container2" style={{ height: '300px' }} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
