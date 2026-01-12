#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vscode = require('vscode'); // for webview command if used inside VSCode

const COMMANDS = {
  'call~': handleCall, 'call~!!': handleCall,
  'build~': handleBuild, 'build~!!': handleBuild,
  'check~': handleCheck,
  'store~': handleStore,
  '.mf~': handleManifest,
  'Show~': handleShow,
  'Argu~!!': handleArgu, 'Argur~!!': handleArgur,
  'Build~!!': handleBuild,
  'Panel~!!': handlePanel, 'SimCore~!!': handleSimCore,
  'TAG~': handleTag, 'Signiture~!!': handleSignature
};

let isUIEnabled = false; // Flag for .mf UI-enabled files

// --- Handlers ---
function handleCall(args){ console.log('Call~', args.join(' ')); }
function handleBuild(args, ctx){
    if(args.join(' ')==='UI'){ 
        isUIEnabled = true;
        console.log('Build~ UI → UI~ |');
        console.log('UI~ |'); // autofill next line
    } else console.log('Build~', args.join(' '));
}
function handleCheck(args){ console.log('Check |', args.join(' ')); }
function handleStore(args,ctx={fileHeader:''}){
  if(ctx.fileHeader==='mf' || ctx.subCommand) console.log(`Store | File-Name ["${args.join(' ')}.mf"]`);
  else console.log('store~', args.join(' '));
}
function handleManifest(args){ console.log('ForceBuildManifest', args.join(' ')); }
function handleArgu(args){ console.log('Argu~!!', args.join(' ')); }
function handleArgur(args){ console.log('Argur~!!', args.join(' ')); }
function handlePanel(args){ console.log('Panel~!!', args.join(' ')); }
function handleSimCore(args){ console.log('SimCore~!!', args.join(' ')); }
function handleTag(args){ console.log('TAG~', args.join(' ')); }
function handleSignature(args){ console.log('Signiture~!!', args.join(' ')); }
function handleShow(args){
  const cmd=args.join(' ');
  if(cmd.includes('ALL | Tree')){
    console.log('--- File Tree ---');
    const tree = listDirTree(process.cwd());
    console.log(tree);
  } else if(cmd.includes('Explorer')){
    openMFExplorer();
  } else console.log('Show~', cmd);
}

// --- File Tree ---
function listDirTree(dir, prefix=''){
  let tree='';
  const files=fs.readdirSync(dir);
  files.forEach((file,i)=>{
    const fullPath=path.join(dir,file);
    const isLast=i===files.length-1;
    tree += prefix + (isLast?'└── ':'├── ') + file + '\n';
    if(fs.statSync(fullPath).isDirectory()){ tree += listDirTree(fullPath,prefix+(isLast?'    ':'│   ')); }
  });
  return tree;
}

// --- .mf Explorer ---
function openMFExplorer(){
  if(!isUIEnabled){ console.log('MF Explorer (UI not enabled)'); return; }
  console.log('Opening Audax UI Preview...');
  vscode.commands.executeCommand('plexcode.openMfPreview', currentFileUri);
}

// --- File Header Detection ---
function detectFileHeader(filePath){
  const header = fs.readFileSync(filePath,'utf-8').split(/\r?\n/)[0].trim();
  switch(header){
    case '.plx': return { type:'plx', lexer:'plexcode' };
    case '.mf': return { type:'mf', lexer:'manifesto', explorer:true, html:true };
    case '.TAG': return { type:'tag', lexer:'signature', prefill:['ASK~!! | USER [ID]','ASK~!! | USER [key]'] };
    default: return { type:'unknown' };
  }
}

// --- Runner ---
const file = process.argv[2];
if(!file){ console.error('Usage: plexcode-shell.js <file.plx/.mf/.TAG>'); process.exit(1); }
const headerInfo = detectFileHeader(file);
let lines = fs.readFileSync(file,'utf-8').split(/\r?\n/);
if(headerInfo.type==='tag' && headerInfo.prefill){ lines=[...headerInfo.prefill,...lines]; }
let currentFileUri = file;
for(let i=0;i<lines.length;i++){
  const line = lines[i].trim();
  if(!line) continue;
  const cmd = line.split(' ')[0];
  const args = line.split(' ').slice(1);
  const context = {subCommand: line.includes('╰──➤'), fileHeader: headerInfo.type};
  if(COMMANDS[cmd]) COMMANDS[cmd](args, context);
  else console.log('Unknown command:', line);
}

// If UI-enabled .mf, trigger Audax automatically
if(headerInfo.type==='mf' && isUIEnabled){
  console.log('Triggering Audax UI Editor for this .mf file...');
  openMFExplorer();
}
