# PlexCode Parser - Quick Start

## Installation

```bash
npm install
npm run build
```

## Run Tests

```bash
# All unit tests (65 tests)
npm run test:unit

# Individual test suites
npm test -- --testPathPattern=tokenizer  # 24 tests
npm test -- --testPathPattern=parser     # 17 tests
npm test -- --testPathPattern=resolver   # 24 tests
```

## Use CLI Tool

```bash
# Parse a file
npm run parse examples/hello.plx

# Show tokens
npm run parse -- --tokens examples/hello.plx

# Show AST
npm run parse -- --ast examples/sensor-access.plx

# Show resolved intents
npm run parse -- --intents examples/build-ui.plx

# Use HTML backend
npm run parse -- --backend html --intents examples/build-ui.plx
```

## Use as Library

```typescript
import { parseAndResolve } from './src/parser/index.js';

// Simple parsing
const result = parseAndResolve(`
  Sniff~ [ALL] | SENSORS
  ╰──➤ detect~!! | sensors
`, 'shell');

console.log('Statements:', result.ast?.statements.length);
console.log('Intents:', result.intents.length);
console.log('Errors:', result.errors.length);

// Access intents
result.intents.forEach(intent => {
  console.log(`${intent.intent.command} → ${intent.intent.name}`);
  console.log('Output:', intent.output);
});
```

## Example Output

```bash
$ npm run parse examples/sensor-access.plx

✓ Parsed 5 statements
✓ Resolved 11 intents
✓ 0 errors, 0 warnings

Commands:
  ASK~!! → auth.ask (1x)
  ACCESS~!! → auth.access (1x)
  Sniff~ → device.sniff (3x)
  detect~!! → device.detect (1x)
  Fetch~!! → device.fetch (1x)
  Store~ → state.store (2x)
  Pair~ → device.pair (1x)
  SEND~!! → exec.send (1x)
```

## Key Features

✅ **150+ Token Types** - Complete PlexCode syntax support  
✅ **20+ Built-in Intents** - Device, UI, Auth, State, Exec, Control  
✅ **4 Backends** - Shell, HTML, NCOM, Python  
✅ **65 Unit Tests** - 100% passing  
✅ **Error Diagnostics** - Helpful suggestions  
✅ **CLI Tool** - Parse, tokenize, resolve  

## Documentation

- Full API docs: `README.md`
- Implementation details: `/IMPLEMENTATION.md`
- Examples: `examples/*.plx`
