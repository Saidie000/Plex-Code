# PlexCode Manifest v0

PlexCode is a declarative, intent-based language.
Execution is determined by resolution, not instruction order.

## Core Concepts

- Headers declare execution context
- Intents declare meaning
- Payloads declare data
- Backends resolve meaning

## Structure

A PlexCode file consists of:

1. Zero or more headers
2. One or more intents

## Headers

Syntax:
plex.header <name>

Example:
plex.header html
plex.header python

Headers do not execute code.
They declare compatible execution targets.

## Intents

Syntax:
plex.intent <namespace.action>
  key: value

Intents must be resolvable by at least one backend.

## Example

plex.header html
plex.header python

plex.intent display.text
  value: "Hello World"
  target: screen
