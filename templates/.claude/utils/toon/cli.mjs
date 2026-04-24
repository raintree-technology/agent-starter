#!/usr/bin/env node
// Thin wrapper around @toon-format/toon + gpt-tokenizer.
// Delegates format work to the canonical npm package; provides a small CLI
// surface for the /toon-* slash commands.

import { readFileSync } from 'node:fs';

let toon;
try {
  toon = await import('@toon-format/toon');
} catch {
  console.error('Missing dependency: @toon-format/toon');
  console.error('Install with: npm i @toon-format/toon');
  process.exit(2);
}

let gptEncode = null;
try {
  ({ encode: gptEncode } = await import('gpt-tokenizer'));
} catch {
  // Optional. Falls back to bytes/4 heuristic with a visible warning.
}

function countTokens(text) {
  if (gptEncode) return gptEncode(text).length;
  return Math.ceil(text.length / 4);
}

function tokenizerLabel() {
  return gptEncode
    ? 'gpt-tokenizer (OpenAI BPE — approximate proxy for Claude)'
    : 'bytes/4 heuristic (install gpt-tokenizer for real counts)';
}

function parseEncodeOptions(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--delimiter') opts.delimiter = args[++i];
    else if (args[i] === '--no-key-folding') opts.keyFolding = false;
  }
  return opts;
}

const [, , command, file, ...args] = process.argv;

if (!command) {
  console.error('Usage: cli.mjs <encode|decode|validate|count|analyze> <file> [options]');
  process.exit(1);
}

function readFile() {
  if (!file) {
    console.error(`Usage: cli.mjs ${command} <file>`);
    process.exit(1);
  }
  return readFileSync(file, 'utf8');
}

switch (command) {
  case 'encode': {
    const raw = readFile();
    const data = JSON.parse(raw);
    const out = toon.encode(data, parseEncodeOptions(args));
    process.stdout.write(out);
    break;
  }
  case 'decode': {
    const raw = readFile();
    const data = toon.decode(raw);
    process.stdout.write(JSON.stringify(data, null, 2));
    break;
  }
  case 'validate': {
    const raw = readFile();
    try {
      toon.decode(raw);
      console.error('valid TOON');
    } catch (e) {
      console.error(`invalid TOON: ${e.message}`);
      process.exit(1);
    }
    break;
  }
  case 'count': {
    const raw = readFile();
    console.log(countTokens(raw));
    break;
  }
  case 'analyze': {
    const raw = readFile();
    const data = JSON.parse(raw);
    const encoded = toon.encode(data);
    const jsonTokens = countTokens(raw);
    const toonTokens = countTokens(encoded);
    const saved = jsonTokens - toonTokens;
    const pct = jsonTokens ? ((saved / jsonTokens) * 100).toFixed(1) : '0.0';
    console.log(`Tokenizer: ${tokenizerLabel()}`);
    console.log(`JSON:      ${jsonTokens} tokens (${raw.length} bytes)`);
    console.log(`TOON:      ${toonTokens} tokens (${encoded.length} bytes)`);
    console.log(`Saved:     ${saved} tokens (${pct}%)`);
    break;
  }
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
