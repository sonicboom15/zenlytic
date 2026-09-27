/**
 * Robust RFC 4180 compliant CSV Parser & Generator Utility for Zenlytic
 */

/**
 * Parses raw CSV string into an array of string arrays (rows and columns)
 */
export function parseRawCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote ("")
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        // Only push row if it contains non-empty fields
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Flush remaining field/row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses CSV text into typed objects using column headers
 */
export function parseCsv<T>(
  csvText: string,
  fieldMapper?: (headerKey: string, rawValue: string) => any
): T[] {
  // If user pasted a JSON string instead, auto-parse gracefully as fallback
  const trimmed = csvText.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const json = JSON.parse(trimmed);
      if (Array.isArray(json)) return json as T[];
    } catch {
      // Not valid JSON, continue with CSV parsing
    }
  }

  const rawRows = parseRawCsv(csvText);
  if (rawRows.length < 2) {
    return [];
  }

  const headers = rawRows[0].map((h) => h.trim());
  const items: T[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    const obj: any = {};

    headers.forEach((header, colIdx) => {
      const rawVal = row[colIdx] !== undefined ? row[colIdx] : '';

      if (fieldMapper) {
        obj[header] = fieldMapper(header, rawVal);
      } else {
        // Auto-type inference
        if (rawVal === '') {
          obj[header] = '';
        } else if (rawVal.toLowerCase() === 'true') {
          obj[header] = true;
        } else if (rawVal.toLowerCase() === 'false') {
          obj[header] = false;
        } else if (!isNaN(Number(rawVal)) && rawVal.trim() !== '') {
          obj[header] = Number(rawVal);
        } else {
          obj[header] = rawVal;
        }
      }
    });

    items.push(obj as T);
  }

  return items;
}

/**
 * Converts headers and row data into a formatted CSV string
 */
export function generateCsv(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const dataLines = rows.map((r) => r.map(escapeCell).join(','));

  return [headerLine, ...dataLines].join('\n');
}

/**
 * Initiates a browser file download of the given CSV content
 */
export function downloadCsvFile(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

