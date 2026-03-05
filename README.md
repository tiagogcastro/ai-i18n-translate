# AI-i18n-Translate

Automate the translation of your internationalization (i18n) JSON files using AI. This library integrates easily with OpenAI (or other AI providers) to translate multiple locales while preserving keys, placeholders, and terminology.

---

## Features

- Automatic translation of i18n JSON files.  
- Supports multiple languages and regional variants (e.g., `en-GB`, `es-MX`).  
- Preserves placeholders (`{{count}}`, `{username}`, etc.) and JSON structure.  
- Creates target locale files automatically if they do not exist.  
- Optional translation summary report generation.  
- Works with OpenAI by default; other AI providers can be used by implementing a compatible `translateChunk` function.  
- Flexible folder and file structure for locales.  
- Supports chunked translation; a `chunkSize` of 10 is a good default for most projects.  
- Contextualizing your application and terminology improves translation quality and prevents errors.

---

## Folder Structure

You can organize your locale files however you prefer. Examples:

```
locales/{locale}/home/page.json       -> locales/en/home/page.json
locales/{locale}/home-page.json       -> locales/en/home-page.json
locales/{locale}.json                 -> locales/en.json
````

> Folder and file names do not matter. The library automatically finds all `.json` files.  
> **Important:** You must define a `baseLocale`. Files that do not exist under the `baseLocale` will not be translated because the source content cannot be determined.

---

## Installation

```bash
npm install ai-i18n-translate
# or
yarn add ai-i18n-translate
````

---

## Usage

### Basic Example with OpenAI

```ts
import { runTranslation } from 'ai-i18n-translate';
import path from 'path';

(async () => {
  await runTranslation({
    baseLocale: "en", // Source language
    targetLocales: ["fr", "es-MX"], // Languages to translate to
    OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
    model: "gpt-4o-mini", // AI model for translation
    basePath: path.resolve(__dirname, 'locales'), // Path to locale files
    chunkSize: 10, // Keys translated per request; 10 is a good default
    reportOptions: {
      enabled: true,
      outputPath: path.resolve(__dirname, 'translation-summary.md'),
    },
    context: `
Terminology:
- Keep product names and brands unchanged

Placeholders:
- Keep all placeholders like {{count}}, {username}, {amount} unchanged

Language-specific guidance:
- "fr" => French: formal, suitable for UI
- "es-MX" => Spanish (Mexico): local expressions

Instructions:
- Return a JSON object preserving all keys from the source.
- Translate each value according to the rules above.
- Do not add explanations or modify keys.
`
  });
})();
```

---

### Context Explanation

* `baseLocale`: The source language of your JSON files.

* `targetLocales`: Array of languages to translate to (e.g., `en`, `es-MX`, `fr`). Target locale files are created automatically if they don't exist.

* `OPENAI_API_KEY`: Your OpenAI API key.

* `model`: The AI model to use for translation.

* `basePath`: Path to your locale files; folder/file structure is flexible.

* `chunkSize`: Number of keys translated per request. 10 is recommended as a safe default.

* `reportOptions`: Optional summary report generation.

  * `enabled`: Enable or disable the report.
  * `outputPath`: Path to save the report.

* `context`: Optional string for terminology, placeholders, or language-specific rules. Contextualizing your application improves translation quality.

---

### Using a Different AI Provider

`runTranslation` is built for OpenAI by default. To use another AI provider (Claude, Gemini, etc.), you do **not** just change the `model`. You need to implement a compatible `translateChunk` function that:

1. Accepts the same inputs: `texts`, `from`, `to`, `context` (and optionally `model` or API key).
2. Returns a Promise resolving to a JSON object with **the same keys** as the input.

Example generic structure:

```ts
import { TranslateChunkFunction, TranslateChunkRequest, runTranslation } from 'ai-i18n-translate';

const translateChunkWithOtherAI: TranslateChunkFunction = async ({ texts, from, to, context, systemPrompt }: TranslateChunkRequest) => {
  // Call your AI provider here (Claude, Gemini, AWS Bedrock, etc.)
  // Apply the context and return a JSON object with the same keys
  return { ...texts }; // replace with actual translations
};

await runTranslation({
  baseLocale: 'en',
  targetLocales: ['fr'],
  basePath: './locales',
  chunkSize: 10,
  context: 'Preserve placeholders and terminology',
  translateChunk: translateChunkWithOtherAI
});
```

> Inputs (`texts`, `from`, `to`, `context`) and outputs (JSON with same keys) **must match** for the library to work correctly with chunking, reporting, and automatic file creation.

---

## Technologies

* Node.js
* TypeScript
* OpenAI SDK

---

## Author

Developed by [Tiago Gonçalves de Castro](https://github.com/tiagogcastro) 🚀
