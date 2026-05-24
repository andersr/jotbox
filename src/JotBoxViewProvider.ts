import * as vscode from 'vscode';
import * as storage from './storage';
import { ToExtensionMessage } from './types';

export class JotBoxViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message: ToExtensionMessage) => {
      switch (message.type) {
        case 'getNotes':
          this._sendNotes();
          break;
        case 'createNote': {
          const newNote = storage.createNote();
          this._sendNotes();
          this._view?.webview.postMessage({ type: 'noteCreated', note: newNote });
          break;
        }
        case 'updateNote': {
          storage.updateNote(message.note);
          this._sendNotes();
          break;
        }
        case 'deleteNote': {
          storage.deleteNote(message.id);
          this._sendNotes();
          break;
        }
        case 'togglePin': {
          storage.togglePin(message.id);
          this._sendNotes();
          break;
        }
      }
    });
  }

  public createNote() {
    const newNote = storage.createNote();
    this._sendNotes();
    this._view?.webview.postMessage({ type: 'noteCreated', note: newNote });
  }

  public refreshNotes() {
    this._sendNotes();
  }

  private _sendNotes() {
    this._view?.webview.postMessage({
      type: 'notesLoaded',
      notes: storage.getNotes(),
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'styles.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'main.js')
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri}" rel="stylesheet">
  <title>JotBox</title>
</head>
<body>
  <div id="app">
    <div id="toolbar">
      <input type="text" id="search" placeholder="Search notes..." />
      <button id="new-note-btn" title="New Note">+</button>
    </div>
    <div id="tag-filter"></div>
    <div id="note-list"></div>
    <div id="note-editor" class="hidden">
      <textarea id="note-content" placeholder="Start typing..."></textarea>
      <div id="tag-input-row">
        <input type="text" id="tag-input" placeholder="Tags (comma-separated)" />
      </div>
      <div id="editor-actions">
        <button id="save-btn">Save</button>
        <button id="cancel-btn">Cancel</button>
        <button id="delete-btn" class="danger">Delete</button>
      </div>
    </div>
  </div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
