const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function activate(context){
  context.subscriptions.push(vscode.commands.registerCommand('plexcode.openMfPreview', function(uri){
    const panel = vscode.window.createWebviewPanel(
      'mfPreview', 'MF Live Preview', vscode.ViewColumn.Two, {enableScripts:true}
    );
    const htmlPath = vscode.Uri.file(path.join(context.extensionPath,'src','webview','mf-webview.html'));
    panel.webview.html = fs.readFileSync(htmlPath.fsPath,'utf-8');

    panel.webview.onDidReceiveMessage(msg=>{
      if(msg.type==='update'){
        vscode.workspace.fs.writeFile(uri, Buffer.from(msg.content,'utf-8'));
      }
    });
  }));
}
exports.activate = activate;
