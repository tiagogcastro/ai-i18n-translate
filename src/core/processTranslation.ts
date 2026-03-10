import { openAITranslateChunk } from "@/services/openai/openai.service";
import {
  ProcessTranslationRequest,
  ProcessTranslationResult,
  TranslateChunkFunction
} from "@/types";
import { flattenJSON, unflattenJSON } from "@/utils/json.utils";
import fs from "fs-extra";
import path from "path";
import { buildDefaultSystemPrompt } from "./buildDefaultSystemPrompt";

export async function processTranslation({
  baseJSON,
  targetLocale,
  baseLocale,
  targetFilePath,
  chunkSize,
  model,
  context,
  OPENAI_API_KEY,
  translateChunk,
}: ProcessTranslationRequest & {
  translateChunk?: TranslateChunkFunction;
}): Promise<ProcessTranslationResult> {

  let aiRequests = 0;
  let keysAdded = 0;
  let keysRemoved = 0;

  await fs.ensureDir(path.dirname(targetFilePath));

  const baseFlat = flattenJSON(baseJSON);

  let targetJSON: any = {};
  let targetFlat: Record<string, string> = {};

  if (await fs.pathExists(targetFilePath)) {
    targetJSON = await fs.readJson(targetFilePath);
    targetFlat = flattenJSON(targetJSON);
  }

  // remove keys que não existem mais
  Object.keys(targetFlat).forEach((key) => {
    if (!(key in baseFlat)) {
      delete targetFlat[key];
      keysRemoved++;
    }
  });

  const missingKeys = Object.keys(baseFlat).filter(
    (key) => !(key in targetFlat)
  );

  for (let i = 0; i < missingKeys.length; i += chunkSize) {
    const chunkKeys = missingKeys.slice(i, i + chunkSize);

    const chunkObject: Record<string, string> = {};

    chunkKeys.forEach((key) => {
      chunkObject[key] = baseFlat[key];
    });

    const systemPrompt = buildDefaultSystemPrompt({
      from: baseLocale,
      to: targetLocale,
      context,
      texts: chunkObject,
      useTextsInPrompt: !!translateChunk
    });

    const translateFn = translateChunk ?? openAITranslateChunk;

    const translated = await translateFn({
      model,
      texts: chunkObject,
      systemPrompt,
      OPENAI_API_KEY,
      from: baseLocale,
      to: targetLocale,
      context,
    });

    aiRequests++;
    keysAdded += chunkKeys.length;

    Object.assign(targetFlat, translated);
  }

  // garantir que todas as keys existem
  Object.keys(baseFlat).forEach((key) => {
    if (!(key in targetFlat)) {
      targetFlat[key] = baseFlat[key];
    }
  });

  const orderedFlat: Record<string, string> = {};

  Object.keys(baseFlat).forEach((key) => {
    orderedFlat[key] = targetFlat[key];
  });

  const finalJSON = unflattenJSON({
    flat: orderedFlat,
  });

  await fs.writeFile(
    targetFilePath,
    JSON.stringify(finalJSON, null, 2)
  );

  return {
    aiRequests,
    keysAdded,
    keysRemoved,
    modified: keysAdded > 0 || keysRemoved > 0,
    baseTotal: Object.keys(baseFlat).length,
    finalTotal: Object.keys(orderedFlat).length,
  };
}