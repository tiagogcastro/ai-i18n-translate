export interface ReportOptions {
  enabled: boolean;
  outputPath: string;
}

export interface TranslateOptions {
  baseLocale: string;
  targetLocales: string[];
  model: string;
  basePath: string;
  chunkSize?: number;
  context?: string;
  reportOptions?: ReportOptions;
  OPENAI_API_KEY?: string;
}

export type FlatJSON = Record<string, string>;

export interface TranslationSummary {
  startedAt: Date;
  baseLocale: string;
  basePath: string;
  model: string;
  chunkSize: number;
  totalBaseFiles: number;
  totalLocales: number;
  totalFilesProcessed: number;
  totalAIRequests: number;
  totalModifiedFiles: number;
  totalSyncedFiles: number;
  totalKeysAdded: number;
  totalKeysRemoved: number;
  executionTime: string;
  details: Record<
    string,
    {
      locale: string;
      targetPath: string;
      modified: boolean;
      keysAdded: number;
      keysRemoved: number;
      baseTotal: number;
      finalTotal: number;
    }[]
  >;
}

export interface UnflattenJSONRequest {
  flat: Record<string, string>;
  original?: any;
}

export interface GetAllJsonFilesFromLocaleRequest {
  basePath: string;
  locale: string;
}

export interface EnsureLocaleFile {
  basePath: string;
  locale: string;
  fileName: string;
}

export interface TranslateChunkRequest {
  model: string;
  texts: Record<string, string>;
  from: string;
  to: string;
  OPENAI_API_KEY?: string;
  context?: string;
  systemPrompt?: string;
}

export interface ProcessTranslationRequest {
  baseJSON: Record<string, string>;
  targetLocale: string;
  baseLocale: string;
  targetFilePath: string;
  chunkSize: number;
  model: string;
  context?: string;
  OPENAI_API_KEY?: string;
}

export interface ProcessTranslationResult {
  aiRequests: number;
  keysAdded: number;
  keysRemoved: number;
  modified: boolean;
  baseTotal: number;
  finalTotal: number;
}

export type TranslateChunkFunction = (req: TranslateChunkRequest) => Promise<Record<string, string>>;
