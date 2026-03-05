import { TranslationSummary } from '@/types';
import fs from "fs-extra";

export const generateSummaryMarkdown = (summary: TranslationSummary) => {
  let detailsSection = `
## 📝 File Details

*Based on files in the directory \`${summary.baseLocale}/\`*
`;

  for (const fileName of Object.keys(summary.details)) {
    const entries = summary.details[fileName];

    const baseTotal =
      entries.length > 0 ? entries[0].baseTotal : 0;

    detailsSection += `\n### 📄 ${fileName} (${baseTotal} keys)\n\n`;

    for (const entry of summary.details[fileName]) {
      let statusText = "";

      if (!entry.modified) {
        statusText = "Already synced";
      } else {
        const additions =
          entry.keysAdded > 0 ? `+${entry.keysAdded}` : "";
        const removals =
          entry.keysRemoved > 0 ? `-${entry.keysRemoved}` : "";

        if (additions && removals) {
          statusText = `Updated (${additions} / ${removals})`;
        } else {
          statusText = `Updated (${additions}${removals})`;
        }
      }

      detailsSection += `- **${entry.locale}:** ${entry.targetPath} - ${statusText} total ${entry.finalTotal}/${entry.baseTotal}\n`;
    }
  }

  return `# Translation Report

**Last updated:** ${summary.startedAt.toLocaleString()}

## ⚙️ Configuration

- **Base language:** ${summary.baseLocale}
- **Locales path:** \`${summary.basePath}\`
- **AI model used:** \`${summary.model}\`
- **Chunk size:** ${summary.chunkSize}

## 📊 General Statistics

- **Base files processed:** ${summary.totalBaseFiles}
- **Locales processed:** ${summary.totalLocales}
- **Total files processed:** ${summary.totalFilesProcessed}
- **AI usage (requests):** ${summary.totalAIRequests}
- **Modified files:** ${summary.totalModifiedFiles}
- **Files already synced before:** ${summary.totalSyncedFiles}
- **Total keys added:** ${summary.totalKeysAdded}
- **Total keys removed:** ${summary.totalKeysRemoved}
- **Total execution time:** ${summary.executionTime}

${detailsSection}
`;
};

export const saveSummary = async (
  markdown: string,
  outputPath: string
) => {
  await fs.writeFile(outputPath, markdown);
};