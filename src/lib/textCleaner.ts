export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'table';
  content: string | string[] | string[][]; // string for paragraph/heading, string[] for list, string[][] for table
}

export interface ParsedAnnouncement {
  subject: string | null;
  metadata: string[];
  boilerplate: string[];
  coverLetter: string | null;
  blocks: ContentBlock[];
  highlights: {
    metrics: string[];
    contacts: string[];
    dates: string[];
  };
}

/**
 * Heuristically parses raw PDF-scraped announcement text into structured content.
 */
export function parseAnnouncementText(rawText: string | null | undefined): ParsedAnnouncement {
  const result: ParsedAnnouncement = {
    subject: null,
    metadata: [],
    boilerplate: [],
    coverLetter: null,
    blocks: [],
    highlights: {
      metrics: [],
      contacts: [],
      dates: [],
    },
  };

  if (!rawText) return result;

  // Extract highlights using regex before splitting lines
  extractHighlights(rawText, result.highlights);

  // Split into lines and normalize whitespace
  const rawLines = rawText.split(/\r?\n/).map(line => line.trim());

  // Step 1: Pre-process lines (reconstruct vertical single-word columns)
  const preProcessedLines = mergeVerticalColumns(rawLines);

  // Step 2: Separate cover letter, metadata, boilerplate, and main content
  const { boilerplate, metadata, subject, coverLetterLines, contentLines } = separateFilingSections(preProcessedLines);

  result.boilerplate = boilerplate;
  result.metadata = metadata;
  result.subject = subject;

  if (coverLetterLines.length > 0) {
    result.coverLetter = formatSectionText(coverLetterLines);
  }

  // Step 3: Parse the remaining main content lines into structural blocks
  result.blocks = parseContentBlocks(contentLines);

  return result;
}

/**
 * Reconstructs lines that have been wrapped into vertical single-word columns by PDF parsing.
 * If 3 or more consecutive lines are very short (1-2 words, < 15 chars) and don't match list/header patterns,
 * they are joined together.
 */
function mergeVerticalColumns(lines: string[]): string[] {
  const result: string[] = [];
  let buffer: string[] = [];

  const flushBuffer = () => {
    if (buffer.length > 0) {
      if (buffer.length >= 3) {
        // Merge them
        result.push(buffer.join(' '));
      } else {
        // Keep separate
        result.push(...buffer);
      }
      buffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') {
      flushBuffer();
      result.push('');
      continue;
    }

    const words = line.split(/\s+/).filter(Boolean);
    const isListOrHeader =
      /^[•\-*o]/.test(line) ||
      /^\d+[\.\)]/.test(line) ||
      /^(Subject|Sub|Dear|To|Ref|Date|Stock Code|Symbol|Scrip Code|ISIN):/i.test(line) ||
      line.toUpperCase() === line;

    // A candidate line is short, has few words, and isn't a list/header metadata line
    const isVerticalColumnCandidate = line.length < 16 && words.length <= 2 && !isListOrHeader;

    if (isVerticalColumnCandidate) {
      buffer.push(line);
    } else {
      flushBuffer();
      result.push(line);
    }
  }
  flushBuffer();

  return result;
}

/**
 * Classifies lines into boilerplate, metadata, cover letter, and main content.
 */
function separateFilingSections(lines: string[]): {
  boilerplate: string[];
  metadata: string[];
  subject: string | null;
  coverLetterLines: string[];
  contentLines: string[];
} {
  const boilerplate: string[] = [];
  const metadata: string[] = [];
  let subject: string | null = null;
  const coverLetterLines: string[] = [];
  const contentLines: string[] = [];

  // Keywords to detect boilerplate (addresses, contact info, CIN numbers)
  const boilerplateKeywords = [
    /registered office/i,
    /nirmal building/i,
    /nariman point/i,
    /corporate identity/i,
    /cin\s*:/i,
    /tel\s*:\s*\+?\d+/i,
    /fax\s*:\s*\+?\d+/i,
    /website\s*:/i,
    /www\./i,
    /e-mail\s*:/i,
    /email\s*:/i,
    /contact@/i,
    /info@/i,
  ];

  // Keywords to detect stock exchange/filing metadata
  const metaKeywords = [
    /national stock exchange/i,
    /bse limited/i,
    /exchange plaza/i,
    /phiroze jeejeebhoy/i,
    /dalal street/i,
    /bandra kurla/i,
    /scrip code/i,
    /stock code/i,
    /symbol\s*:/i,
    /isin\s*:/i,
    /subject\s*:/i,
    /sub\s*:/i,
    /dear sir/i,
    /digitally signed by/i,
    /date:\s*\d{4}/i,
    /\+05'30'/i, // Indian standard timezone offset commonly in digital signatures
  ];

  // Closings that mark the end of the cover letter
  const coverLetterClosings = [
    /thanking you/i,
    /yours faithfully/i,
    /yours truly/i,
    /yours sincerely/i,
    /for\s+[a-z]+/i,
    /company secretary/i,
    /compliance officer/i,
    /authorized signatory/i,
  ];

  let inCoverLetter = false;
  let coverLetterFinished = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') continue;

    // Check if line contains digital signature info or timestamp, route to metadata/boilerplate
    const isDigitalSignature = /digitally signed by/i.test(line) || /date:\s*\d{4}\.\d{2}\.\d{2}/i.test(line) || /\+05'30'/.test(line);
    if (isDigitalSignature) {
      metadata.push(line);
      continue;
    }

    // Check if line is boilerplate
    const isBoilerplate = boilerplateKeywords.some(regex => regex.test(line));
    if (isBoilerplate && !inCoverLetter) {
      boilerplate.push(line);
      continue;
    }

    // Check if line is filing metadata
    const isMeta = metaKeywords.some(regex => regex.test(line));
    if (isMeta && !inCoverLetter) {
      metadata.push(line);
      // Capture subject line if present
      if (/^(subject|sub)\s*:/i.test(line)) {
        subject = line.replace(/^(subject|sub)\s*:\s*/i, '');
      }
      // If we see "Dear Sir/Madam" or "Subject", we are entering the cover letter
      if (/dear sir/i.test(line) || /^(subject|sub)\s*:/i.test(line)) {
        inCoverLetter = true;
      }
      continue;
    }

    // If we've already started the cover letter
    if (inCoverLetter && !coverLetterFinished) {
      coverLetterLines.push(line);

      // Check if this line signals the end of the cover letter (signatures)
      const isClosing = coverLetterClosings.some(regex => regex.test(line));
      if (isClosing) {
        // Look ahead to see if the next few lines are signature names/titles and include them in cover letter
        let lookAheadIndex = i + 1;
        while (lookAheadIndex < lines.length && lookAheadIndex < i + 5) {
          const nextLine = lines[lookAheadIndex];
          if (nextLine === '') {
            lookAheadIndex++;
            continue;
          }
          if (
            nextLine.toUpperCase() === nextLine ||
            /secretary/i.test(nextLine) ||
            /officer/i.test(nextLine) ||
            /signatory/i.test(nextLine) ||
            /encl/i.test(nextLine) ||
            /digitally signed/i.test(nextLine) ||
            /date:/i.test(nextLine) ||
            /\+05'30'/.test(nextLine)
          ) {
            coverLetterLines.push(nextLine);
            i = lookAheadIndex; // advance main pointer
            lookAheadIndex++;
          } else {
            break;
          }
        }
        coverLetterFinished = true;
        inCoverLetter = false;
      }
      continue;
    }

    // Otherwise, this is main content text
    contentLines.push(line);
  }

  return {
    boilerplate,
    metadata,
    subject,
    coverLetterLines,
    contentLines,
  };
}

/**
 * Reflows lines into natural paragraphs and formats them.
 */
function formatSectionText(lines: string[]): string {
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];

  for (const line of lines) {
    if (line === '') {
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
      continue;
    }

    currentParagraph.push(line);

    // Heuristically end paragraph on punctuation
    if (/[.!?]$/.test(line)) {
      paragraphs.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' '));
  }

  return paragraphs.join('\n\n');
}

/**
 * Parses content lines into structured Blocks (Headings, Lists, Tables, Paragraphs).
 */
function parseContentBlocks(lines: string[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let currentType: 'paragraph' | 'list' | 'table' | null = null;
  let textBuffer: string[] = [];
  let tableRows: string[][] = [];

  const flushBuffer = () => {
    if (currentType === 'paragraph' && textBuffer.length > 0) {
      // Clean up text and create paragraph block
      blocks.push({
        type: 'paragraph',
        content: reflowParagraphText(textBuffer),
      });
    } else if (currentType === 'list' && textBuffer.length > 0) {
      blocks.push({
        type: 'list',
        content: [...textBuffer],
      });
    } else if (currentType === 'table' && tableRows.length > 0) {
      blocks.push({
        type: 'table',
        content: [...tableRows],
      });
    }
    textBuffer = [];
    tableRows = [];
    currentType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === '') {
      flushBuffer();
      continue;
    }

    // 1. Detect Headings: short, non-punctuation, upper-case or bold looking
    const isHeading =
      line.length < 150 &&
      !/[.!?]$/.test(line) &&
      (line.toUpperCase() === line ||
        line.startsWith('Sub:') ||
        line.startsWith('Subject:') ||
        /^(Annexure|Schedule|Appendix)\s+[A-Z\d]/i.test(line) ||
        (line.length < 80 && i < lines.length - 1 && lines[i + 1] === ''));

    if (isHeading) {
      flushBuffer();
      blocks.push({
        type: 'heading',
        content: line,
      });
      continue;
    }

    // 2. Detect Lists: starts with bullet or number
    const isList = /^[•\-\*o]\s+/.test(line) || /^\d+[\.\)]\s+/.test(line);

    if (isList) {
      if (currentType !== 'list') {
        flushBuffer();
        currentType = 'list';
      }
      // Remove bullet character for clean rendering
      const cleanedListLine = line.replace(/^[•\-\*o]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
      textBuffer.push(cleanedListLine);
      continue;
    }

    // 3. Detect Tables: lines with multiple spaces or tab separates
    const columns = line.split(/\s{3,}|\t|\|/).map(c => c.trim()).filter(Boolean);
    const isTable = columns.length >= 2 && line.includes('   '); // at least 3 spaces separator

    if (isTable) {
      if (currentType !== 'table') {
        flushBuffer();
        currentType = 'table';
      }
      tableRows.push(columns);
      continue;
    }

    // 4. Default: Paragraph
    if (currentType !== 'paragraph') {
      flushBuffer();
      currentType = 'paragraph';
    }
    textBuffer.push(line);
  }

  flushBuffer();
  return blocks;
}

/**
 * Reflows lines of text by merging lines that end without sentence-ending punctuation.
 */
function reflowParagraphText(lines: string[]): string {
  const result: string[] = [];
  let currentLine = '';

  for (const line of lines) {
    if (currentLine === '') {
      currentLine = line;
    } else {
      // Heuristic: if currentLine doesn't end with sentence terminal punctuation,
      // it is a continuation. Merge with space.
      const endsWithPunctuation = /[.!?]$/.test(currentLine);
      if (!endsWithPunctuation) {
        currentLine += ' ' + line;
      } else {
        result.push(currentLine);
        currentLine = line;
      }
    }
  }

  if (currentLine !== '') {
    result.push(currentLine);
  }

  return result.join('\n\n');
}


/**
 * Extracts highlights (metrics, contact details, dates) from raw text.
 */
function extractHighlights(text: string, highlights: { metrics: string[]; contacts: string[]; dates: string[] }) {
  // 1. Extract emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex) || [];
  highlights.contacts.push(...Array.from(new Set(emails)).slice(0, 3));

  // 2. Extract key metrics (currency in Crores/Lakhs, MW, percentages)
  const metricRegex = /\b\d+(?:\.\d+)?\s*(?:MW|MWp|MW\s*AC|MW\s*DC|Crore|Lakh|Billion|%|percent|Rs\.?|INR)\b/gi;
  const metrics = text.match(metricRegex) || [];
  highlights.metrics.push(...Array.from(new Set(metrics)).slice(0, 5));

  // 3. Extract dates
  const dateRegex = /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b,?\s+\d{4}|\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/gi;
  const dates = text.match(dateRegex) || [];
  highlights.dates.push(...Array.from(new Set(dates)).slice(0, 3));
}
