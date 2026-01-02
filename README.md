# Plex Code Core

**Plex Code** is a declarative, intent-based programming language designed to define *meaning*, not instructions.  
Execution is determined by **resolution**, not traditional instruction order.

## Key Concepts

- **Headers** declare execution context.
- **Intents** declare semantic actions.
- **Payloads** carry data for the intent.
- **Backends** resolve intents into execution.

## Why Plex Code Exists

- Eliminate the need for multiple languages.
- Provide a single declarative manifest.
- Separate developer intent from execution backend.
- Enable rapid prototyping across platforms (HTML, Python, AR overlays, etc.).

## Example Plex Code

plex.header html
plex.header python

plex.intent display.text
value: "Hello World"
target: screen

shell
Copy code

## Structure

/plexcode
/spec # Language spec (plex.manifest.md)
/core # Parser, resolver, runtime stubs
/tests # Example plex code files

css
Copy code

## Getting Started

1. Open terminal
2. Use `cat` to inspect Plex code files
3. Run the parser stub to convert `.px` into a manifest
4. Use resolver stub to simulate execution