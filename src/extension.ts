// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { copyDiagnosticsToClipboard } from "./diagnosticsProcessor";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Register the Run lint2prompt command
  const lint2promptCommand = vscode.commands.registerCommand(
    "lint2prompt.runLint2prompt",
    async () => {
      // Call the function to copy diagnostics to clipboard
      const hasProblems = await copyDiagnosticsToClipboard();

      // Show the result message
      if (hasProblems) {
        vscode.window.showInformationMessage("Problems copied to clipboard.");
      } else {
        vscode.window.showInformationMessage(
          "No problems found in the workspace."
        );
      }
    }
  );

  context.subscriptions.push(lint2promptCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
