"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JotBoxViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const storage = __importStar(require("./storage"));
class JotBoxViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((message) => {
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
    createNote() {
        const newNote = storage.createNote();
        this._sendNotes();
        this._view?.webview.postMessage({ type: 'noteCreated', note: newNote });
    }
    refreshNotes() {
        this._sendNotes();
    }
    _sendNotes() {
        this._view?.webview.postMessage({
            type: 'notesLoaded',
            notes: storage.getNotes(),
        });
    }
    _getHtmlForWebview(webview) {
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'styles.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'main.js'));
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
exports.JotBoxViewProvider = JotBoxViewProvider;
function getNonce() {
    let text = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}
//# sourceMappingURL=JotBoxViewProvider.js.map