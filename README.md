# AI Product Advisor

This project is a React Native (Expo) experience that lets shoppers describe their needs in natural language and receive tailored recommendations from a catalog-aware AI advisor.

## Prerequisites

- Node.js 18+
- npm 9+
- A valid Gemini API key with access to the `gemini-1.5-flash` model

## Installation

Install dependencies after cloning the repository:

```bash
npm install
```

## Running the web experience

Set the Gemini API key inline and start the Expo web bundler:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=ENTER YOUR GEMINI_API_KEY npm run web
```

The Expo CLI will open the experience in your default browser. Submit a natural-language request on the Advisor screen to receive recommendations drawn from the provided product catalog.

## Troubleshooting

- Ensure the API key has access to the Gemini model family; otherwise requests will fail with authorization errors.
- If the CLI cannot connect to Expo services, re-run the command with a stable internet connection or try the `--offline` flag for local assets.