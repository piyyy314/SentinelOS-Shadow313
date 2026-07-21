# SentinelOS & SHADOW313

![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)

Welcome to the official repository for **SentinelOS** and **SHADOW313**.

## Overview
- **SHADOW313**: A Quantum-Ready CLI designed to bridge the gap between classical developer environments and the emerging world of quantum computing. It brings local-first quantum simulation and verification directly to your terminal.
- **SentinelOS**: An advanced, next-generation security command center and dashboard. It visualizes and manages advanced cryptographic protocols, Post-Quantum Cryptography (PQC), swarm defenses, and Zero-Trust architectures.

## Architecture & Tech Stack
These projects are built from the ground up prioritizing speed, security, and aesthetics:
*   **Vanilla HTML5 / CSS3 / JavaScript (ES6+)** - Absolutely zero off-the-shelf frameworks.
*   **Local-First Design** - No forced cloud dependencies.
*   **Canvas & WebGL** - Used for advanced data visualization and real-time defensive monitoring.
*   **Vercel Routing** - Ready for immediate static deployment via edge networks.

## Features
*   **313 Temporal Binding:** Tamper-evident cryptographic logging for quantum experiments.
*   **Post-Quantum Cryptography (PQC) Readiness:** Real-time metrics and simulations for algorithms like CRYSTALS-Dilithium.
*   **Zero-Trust Network Access (ZTNA) Grid:** Granular visualization of node authentication.
*   **Quantum Thought Engine (QTE):** Terminal-based AI agent interface for running local quantum algorithms via Qiskit's AerSimulator protocols.
*   **AEGIS Ultimate Master Deployment:** Includes the AEGIS Python master deployment script for Monte Carlo threat simulations and active defense honeypots.

## Uploading Project Files

This repository now includes tracked placeholder directories for future asset and fixture uploads. See [docs/upload-paths.md](docs/upload-paths.md) for the canonical path map for SentinelOS and SHADOW313 files.

## Getting Started

### Deploy to Vercel
This repository is optimized for Vercel. 
1. Import this repository to a new Vercel Project.
2. The project uses standard HTML, so no build step is required.
3. Configure your domains. The included `vercel.json` will automatically route:
   *   `shadow313.com` ➔ SHADOW313 Terminal Interface
   *   `shadow313.dev` ➔ SentinelOS Advanced Dashboard

### Run Locally
To run the project locally, simply start a local web server from the root directory:
```bash
# Using Python
python -m http.server 8081
```
Then navigate to `http://localhost:8081/shadow313/` or `http://localhost:8081/sentinelos/`.

## License
This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.


### Local Ollama CLI mode

The Vercel website is a static demo. Live AI responses are intended to run locally through Shadow313 CLI connected to Ollama:

```bash
ollama serve
ollama pull mistral:7b
shadow313 config --set ai.backend ollama
shadow313 config --set ai.endpoint http://localhost:11434
shadow313 config --set ai.model mistral:7b
shadow313 ask "hello"
```

Vercel production cannot reach `http://localhost:11434` on a developer machine.
