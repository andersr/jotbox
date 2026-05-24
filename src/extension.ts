import * as vscode from 'vscode';
import { JotBoxViewProvider } from './JotBoxViewProvider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new JotBoxViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('jotbox.notesView', provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jotbox.newNote', async () => {
      await vscode.commands.executeCommand('jotbox.notesView.focus');
      provider.createNote();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jotbox.refreshNotes', () => {
      provider.refreshNotes();
    })
  );
}

export function deactivate() {}
