<div align="center">
    <img src="https://raw.githubusercontent.com/christopherthompson81/tabbyUI/refs/heads/main/src/assets/tabby_web.png" />
</div>

# tabbyUI

A modern chat interface for tabbyAPI that provides an intuitive way to interact with large language models.

## Features

- Backendless, all code runs in your browser
- Support for multimodal interactions (text and image)
- Specialized rendering for Markdown, thinking, inline and display LaTeX, and programming language syntax.
- One-click model switching for different tasks:
  - General Assistant
  - Vision tasks
  - Coding assistance
  - Chain-of-thought reasoning
- Conversation organization with folders
- Conversations and settings persistence using localStorage
- Interfaces for LoRAs, Templates, Tokenization, and Sampler Overrides (Embeddings/Retrival to come)

## Getting Started

1. Ensure you have a running [tabbyAPI](https://github.com/theroyallab/tabbyAPI) instance
2. Configure your server URL and API keys in the settings
3. Load your preferred model through the model management interface
4. Start chatting!

An AWS deployed instance is available at: [https://main.d1nwbxsgjn09jn.amplifyapp.com/](https://main.d1nwbxsgjn09jn.amplifyapp.com/). However, this would require mixed-mode content enabled to access a conventionally-deployed local TabbyAPI server.

## Development

This project is built with:
- React + TypeScript
- Material-UI components
- Vite build system

To run locally:
```bash
npm install
npm run build
npm run preview
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
