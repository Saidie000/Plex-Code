#!/usr/bin/env node
const fs = require('fs');

// === PlexCode Command Table ===
const COMMANDS = {
  'Argu~!!': handleArgu,
  'Argur~!!': handleArgur,
  'Build~!!': handleBuild,
  'Build~': handleBuild,
  'build~': handleBuild,
  'Ext~': handleExt,
  'Signiture~!!': handleSignature,
  'TAG~': handleTag,
  'Pull~': handlePull,
  'Import~': handleImport,
  'Store~': handleStore,
  'Bind~': handleBind,
  'Call~': handleCall,
  'Detect~': handleDetect,
  'SimCore~!!': handleSimCore,
  'Panel~!!': handlePanel,
  'Core~': handleCore,
  'Ouija~': handleOuija,
  'header~': handleHeader,
  'show~': handleShow,
  'text': handleText,
  'Pair~': handlePair,
  'UWB~!!': handleUWB,
  'n~': handleN,
  'Syntex': handleSyntex,
  'syntex': handleSyntex,
  'script': handleScript
};

// === Command Handlers ===
function handleArgu(args) { console.log('Argu~!!', args.join(' ')); }
function handleArgur(args) { console.log('Argur~!!', args.join(' ')); }
function handleBuild(args) { console.log('Build~', args.join(' ')); }
function handleExt(args) { console.log('Ext~', args.join(' ')); }
function handleSignature(args) { console.log('Signiture~!!', args.join(' ')); }
function handleTag(args) { console.log('TAG~', args.join(' ')); }
function handlePull(args) { console.log('Pull~', args.join(' ')); }
function handleImport(args) { console.log('Import~', args.join(' ')); }
function handleStore(args) { console.log('Store~', args.join(' ')); }
function handleBind(args) { console.log('Bind~', args.join(' ')); }
function handleCall(args) { console.log('Call~', args.join(' ')); }
function handleDetect(args) { console.log('Detect~', args.join(' ')); }
function handleSimCore(args) { console.log('SimCore~!!', args.join(' ')); }
function handlePanel(args) { console.log('Panel~!!', args.join(' ')); }
function handleCore(args) { console.log('Core~', args.join(' ')); }
function handleOuija(args) { console.log('Ouija~', args.join(' ')); }
function handleHeader(args) { console.log('header~', args.join(' ')); }
function handleShow(args) { console.log('show~', args.join(' ')); }
function handleText(args) { console.log('text', args.join(' ')); }
function handlePair(args) { console.log('Pair~', args.join(' ')); }
function handleUWB(args) { console.log('UWB~!!', args.join(' ')); }
function handleN(args) { console.log('n~', args.join(' ')); }
function handleSyntex(args) { console.log('Syntex/syntex', args.join(' ')); }
function handleScript(args) { console.log('script', args.join(' ')); }

// === PlexCode File Runner ===
const file = process.argv[2];
if (!file) {
  console.error('Usage: plexcode-shell.js <file.plx>');
  process.exit(1);
}

const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/);

for (const line of lines) {
  const cmd = line.split(' ')[0];
  const args = line.split(' ').slice(1);
  if (COMMANDS[cmd]) {
    COMMANDS[cmd](args);
  } else {
    console.log('Unknown command:', line);
  }
}
