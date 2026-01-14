# PlexCode Import Feature

## Overview

The `import~` command allows you to import and install packages (`.k!t` files) into your PlexCode environment. When you try to import a package that doesn't exist on your system, PlexCode will automatically prompt you to install it from the package registry.

## Syntax

```plexcode
import~ <package_name>
```

## Example Usage

### Basic Import

```plexcode
.plx

import~ blender
```

**Output:**
```
|| !! blender doesn't exist. Would you like me to install blender.k!t onto your system? [ Y ] [ N ]
|| Y
|| Now installing blender.k!t from blender.org/NCOM
|| |████████████████████████████████████████| 100%
|| ✓ blender installed successfully!
```

### Multiple Imports

```plexcode
.plx

import~ blender
import~ photoshop
import~ vscode
```

### Import with Nonexistent Package

```plexcode
import~ nonexistent_package
```

**Output:**
```
|| !! nonexistent_package doesn't exist in the package registry.
```

## Available Packages

The following packages are currently available in the registry:

| Package | Version | Source | Description |
|---------|---------|--------|-------------|
| blender | 1.0.0 | blender.org/NCOM | Blender 3D modeling and animation software |
| photoshop | 1.0.0 | adobe.com/NCOM | Adobe Photoshop image editing software |
| vscode | 1.0.0 | code.visualstudio.com/NCOM | Visual Studio Code editor |
| chrome | 1.0.0 | google.com/NCOM | Google Chrome web browser |
| unity | 1.0.0 | unity.com/NCOM | Unity game engine |
| unreal | 1.0.0 | unrealengine.com/NCOM | Unreal Engine game engine |

## Package Manager API

### Check if Package Exists

```typescript
import { globalPackageManager } from './src/parser/index.js';

const isAvailable = globalPackageManager.isPackageAvailable('blender');
const isInstalled = globalPackageManager.isPackageInstalled('blender');
```

### Get Package Information

```typescript
const pkg = globalPackageManager.getPackageInfo('blender');
console.log(pkg?.name);        // 'blender'
console.log(pkg?.version);     // '1.0.0'
console.log(pkg?.source);      // 'blender.org/NCOM'
console.log(pkg?.type);        // 'k!t'
console.log(pkg?.description); // 'Blender 3D modeling and animation software'
```

### Install Package Programmatically

```typescript
await globalPackageManager.installPackage('blender', (progress) => {
  console.log(`${progress.status}: ${progress.message} (${progress.progress}%)`);
});
```

### Add Custom Package to Registry

```typescript
globalPackageManager.addPackageToRegistry({
  name: 'myapp',
  version: '1.0.0',
  source: 'myapp.com/NCOM',
  type: 'k!t',
  description: 'My custom application'
});
```

## Backend Support

The `import~` command supports multiple backends:

### Shell Backend (Default)

```bash
$ plexcode-parse examples/import-blender.plx

|| !! blender doesn't exist. Would you like me to install blender.k!t onto your system? [ Y ] [ N ]
|| Y
|| Now installing blender.k!t from blender.org/NCOM
|| |████████████████████████████████████████| 100%
|| ✓ blender installed successfully!
```

### HTML Backend

Generates an interactive HTML prompt:

```html
<div class="import-prompt">
  <p>⚠️ blender doesn't exist. Would you like to install blender.k!t?</p>
  <button onclick="installPackage('blender')" class="btn-install">Yes</button>
  <button onclick="cancelInstall()" class="btn-cancel">No</button>
  <div id="install-progress" style="display:none;">
    <div class="progress-bar">
      <div class="progress-fill" id="progress-fill"></div>
    </div>
    <p id="progress-message">Installing...</p>
  </div>
</div>
```

### NCOM Backend

```
NCOM_IMPORT[blender]
```

## Intent Resolution

The `import~` command resolves to the `package.import` intent:

```typescript
{
  name: 'package.import',
  command: 'import~',
  category: 'PACKAGE',
  requiredParams: ['package'],
  optionalParams: [],
  description: 'Import and install packages (.k!t files)',
  examples: ['import~ blender', 'import~ photoshop', 'import~ vscode']
}
```

## CLI Usage

```bash
# Parse file with imports
npm run parse examples/import-packages.plx

# Show detailed intent information
npm run parse -- --intents examples/import-blender.plx

# Use HTML backend
npm run parse -- --backend html examples/import-blender.plx
```

## Testing

Run the import feature tests:

```bash
npm test -- --testPathPattern=import
```

**Test Coverage:**
- 29 tests covering:
  - Tokenization of `import~` and `import~!!`
  - Parsing of import statements
  - Package manager functionality
  - Intent resolution
  - Multi-backend output
  - Integration tests

## Error Handling

### Package Not in Registry

```plexcode
import~ nonexistent_package
```

Output:
```
|| !! nonexistent_package doesn't exist in the package registry.
```

### Already Installed Package

If a package is already marked as installed:

```
|| ✓ blender is already installed.
```

## Implementation Details

### Files Created

- `/src/parser/lexer/token-types.ts` - Added `IMPORT` and `IMPORT_BANG` tokens
- `/src/parser/lexer/tokenizer.ts` - Added tokenization support
- `/src/parser/parser/parser.ts` - Added parser support for import command
- `/src/parser/resolver/package-manager.ts` - Package management system (180 LOC)
- `/src/parser/resolver/builtins.ts` - Added `package.import` intent
- `/src/parser/import.test.ts` - Comprehensive test suite (29 tests)
- `/src/parser/examples/import-packages.plx` - Example file
- `/src/parser/examples/import-blender.plx` - Single import example

### Architecture

```
import~ blender
    ↓ (Tokenizer)
[IMPORT, IDENTIFIER("blender")]
    ↓ (Parser)
StatementNode { command: "import~", parameters: ["blender"] }
    ↓ (Resolver)
Intent { name: "package.import", category: "PACKAGE" }
    ↓ (Package Manager)
Check Registry → Generate Prompt → Simulate Installation
    ↓ (Output)
"|| !! blender doesn't exist. Would you like me to install..."
```

## Future Enhancements

- [ ] Network integration for real package downloads
- [ ] Dependency resolution for packages with dependencies
- [ ] Package versioning and updates
- [ ] Local package caching
- [ ] Package signing and verification
- [ ] Custom package repositories
- [ ] Package search functionality
- [ ] Package uninstall command

## Related Commands

- `import~` - Import package (shows prompt)
- `import~!!` - Force import without prompt (future enhancement)

## See Also

- [PlexCode Parser README](/src/parser/README.md)
- [PlexCode Quick Start](/src/parser/QUICKSTART.md)
- [Package Manager API](/src/parser/resolver/package-manager.ts)
