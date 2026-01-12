# NCOM Systems  
## `.k!t` — Unified Application Package

> **NCOM’s Official Application File Format**

The `.k!t` file is the foundational application container used by **NCOM Systems**.  
It functions as a **single executable package** that binds together an app’s code, identity, permissions, and cryptographic trust.

In the same way that `.exe`, `.apk`, or `.ipa` define how traditional apps are installed and trusted,  
`.k!t` defines how NCOM applications are **compiled, verified, deployed, and executed**.

---

## What is a `.k!t` file?

A `.k!t` file is a **tri-layer application container** composed of three tightly bound components:

| File | Role |
|------|------|
| `app.TAG` | Identity, service bindings, and permissions |
| `app.plx` | Core executable logic written in **PLX** |
| `app.mf` | Manifest, certificates, and trust authority |

Together, these files form a **cryptographically sealed application unit**.

---

## Internal Structure

YourApp.k!t
├── app.TAG → App relationships & service bindings
├── app.plx → Executable PLX code
└── app.mf → Manifest, signatures, and certificates




Each file has a distinct responsibility and none can be removed without invalidating the package.

---

## `app.TAG` — Application Relationship Layer

The **TAG file** defines how an application exists inside the NCOM ecosystem.

It acts as a **mediator** between:
- The app itself
- External services
- The manifesto and trust layer

It controls:
- What services the app may call
- What devices or sensors it may access
- What internal NCOM subsystems it may interact with

Think of it as the **living contract** between the app and the system.

---

## `app.plx` — Core Execution Logic

`app.plx` contains the **actual program**.

It is written in **PLX**, NCOM’s native programming language designed for:
- Hardware-aware execution  
- Secure system interaction  
- Sensor and neural-layer control  
- Distributed runtime environments  

This is where the application’s behavior lives.

---

## `app.mf` — Manifest & Trust Container

The **MF file** is the authority layer of the app.

It behaves as:
- A cryptographic container  
- A certificate store  
- A verification API  

It contains:
- Developer signatures  
- Device compatibility  
- Permission grants  
- Integrity hashes  
- Trust and identity anchors  

Without a valid `app.mf`, a `.k!t` file **cannot be executed**.

---

## Why `.k!t` Exists

Traditional app formats treat:
- Identity
- Permissions
- Code
- Trust  

…as loosely coupled systems.

`.k!t` makes them **inseparable**.

Every NCOM app is:
- Identified
- Authorized
- Verified
- And executed  

…as a single atomic unit.

---

## Format Equivalency

| Platform | File Type |
|---------|-----------|
| Windows | `.exe` |
| Android | `.apk` |
| iOS | `.ipa` |
| **NCOM** | **`.k!t`** |

But unlike traditional formats, `.k!t` is **self-describing, cryptographically anchored, and service-aware by design**.

---

## Summary

The `.k!t` format is not just a file — it is the **NCOM application organism**.

It binds:
- **What the app is**
- **What it can do**
- **Who it belongs to**
- **And whether it is trusted**

…into one unbreakable digital entity.

---

