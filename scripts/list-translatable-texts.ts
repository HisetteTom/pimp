import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC_DIR = join(process.cwd(), 'src');

// Regex patterns to find potential hardcoded strings in JSX/TSX
// 1. Text between JSX tags: >Some Text<
const JSX_TEXT_REGEX = />([^<>{}\s\n\d][^<>{}\n]*)</g;
// 2. String props: label="Some Text" or placeholder="Some Text"
const PROP_TEXT_REGEX =
  /\b(?:label|placeholder|title|description|text|message|confirmText|cancelText)="([^"]+)"/g;

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  for (const file of files) {
    // Ignore hidden files and standard non-source directories
    if (file.startsWith('.') || file === 'node_modules' || file === 'tests' || file === 'coverage')
      continue;
    const name = join(dir, file);
    if (statSync(name).isDirectory()) {
      getFilesRecursively(name, fileList);
    } else if (name.endsWith('.tsx') || name.endsWith('.ts')) {
      fileList.push(name);
    }
  }
  return fileList;
}

interface TranslatableEntry {
  line: number;
  text: string;
  source: 'jsx-content' | 'prop-attribute';
}

function analyzeFile(filePath: string): TranslatableEntry[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const entries: TranslatableEntry[] = [];

  lines.forEach((lineText, index) => {
    // Skip import lines, comments, or hook invocations like console.log or actions
    const trimmed = lineText.trim();
    if (trimmed.startsWith('import') || trimmed.startsWith('//') || trimmed.startsWith('console.'))
      return;

    // Search JSX tags content
    let match;
    const jsxRegex = new RegExp(JSX_TEXT_REGEX);
    while ((match = jsxRegex.exec(lineText)) !== null) {
      const txt = match[1].trim();
      // Skip simple layout tags, emojis, single symbols, or icons
      if (txt && txt.length > 1 && !/^[0-9\s.,\/#!$%\^&\*;:{}=\-_`~()]+$/.test(txt)) {
        entries.push({
          line: index + 1,
          text: txt,
          source: 'jsx-content',
        });
      }
    }

    // Search prop attributes
    const propRegex = new RegExp(PROP_TEXT_REGEX);
    while ((match = propRegex.exec(lineText)) !== null) {
      const txt = match[1].trim();
      if (txt && txt.length > 1) {
        entries.push({
          line: index + 1,
          text: txt,
          source: 'prop-attribute',
        });
      }
    }
  });

  return entries;
}

function main() {
  console.log('# TRANSLATABLE TEXT SCAN REPORT\n');
  console.log('Scanning directories under `src/` for hardcoded UI text...\n');

  const files = getFilesRecursively(SRC_DIR);
  let totalStrings = 0;
  let fileCount = 0;

  files.forEach((file) => {
    const relativePath = relative(process.cwd(), file);
    const results = analyzeFile(file);

    if (results.length > 0) {
      fileCount++;
      totalStrings += results.length;
      console.log(`### 📄 ${relativePath}`);
      console.log('| Line | Type | Hardcoded String |');
      console.log('| :--- | :--- | :--- |');
      results.forEach((r) => {
        console.log(`| L${r.line} | \`${r.source}\` | ${r.text} |`);
      });
      console.log('\n');
    }
  });

  console.log('## SUMMARY');
  console.log(`- **Files scanned with hardcoded texts**: ${fileCount}`);
  console.log(`- **Total hardcoded text entries found**: ${totalStrings}`);
}

main();
