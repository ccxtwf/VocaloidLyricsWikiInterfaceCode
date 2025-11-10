export const rxMatchBolded = /^\s*('{3}|<b>)(?<text>.*)('{3}|<\/b>)\s*$/;
export const rxMatchBoldedCss = /font-weight\s*:\s*bold\b\s*;*/;
export const rxMatchItalicised = /^\s*('{2}|<i>)(?='{3,}|\s*\b)(?<text>.*)(?<='{3,}|\b\s*)('{2}|<\/i>)\s*$/;
export const rxMatchItalicisedCss = /font-style\s*:\s*italic\b\s*;*/;
const rxLyricsTableWikitext = /(?<header>\{\|\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]table[ _]class\}\}\s*\n\|-\s*class\s*=\s*["'][^\n]*\blyrics-table-header\b[^\n]*["']\s*\n!\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]header\}\})\s*\n(?<body>.*?\|\})/gs;
const rxLyricsTableRow = /\|-(?<rowStyle>.*?)(?<contents>\n.*?)\n(?=\|-|\|\})/gs;
const rxInlineCssStyle = /style\s*=\s*["']\s*([^\n]*?)[\s;]*["']/;
const rxCheckSharedColumn = /^\s*(\{\{(?:[Tt]emplate:|)[Ss]hared[^\}]*\}\}|[^\n]*?colspan=\s*(?:["']|)\s*\d+\s*(?:["']|)[^\n]*?\|)/g;
const rxSplitTableRow = /(?<=\n\|).*?(?=\n\||$)/g;
const rxIsWholeStringNewline = /^\s*<br\s*\/?\s*>\s*$/;

/**
 * 
 * @param wikipageContents 
 * @returns 
 */
export function getWikipageTables(wikipageContents: string): RegExpExecArray[] {
  return Array.from(wikipageContents.matchAll(rxLyricsTableWikitext));
}

/**
 * 
 * @param tableBody 
 * @param maxColumns 
 * @returns [lyrics: string[][], numColumns: number]
 */
export function parseLyrics(tableBody: string, maxColumns: number): [string[][], number] {
  const lyrics: string[][] = [];
  let numColumns = 0; 
  const tableRows = Array.from(tableBody.matchAll(rxLyricsTableRow))
    .map((tableRow) => {
      const contents = tableRow[0];
      let customStyle: RegExpMatchArray | string | null = tableRow.groups!['rowStyle']!.match(rxInlineCssStyle);
      customStyle = customStyle === null ? '' : customStyle[1]+';';
      const lines = tableRow.groups!['contents']!;
      const splitLyrics = Array.from(lines.matchAll(rxSplitTableRow)).map(([row]) => row);
      numColumns = Math.max(numColumns, splitLyrics.length);
      return { contents, customStyle, splitLyrics };
    });
  numColumns = Math.min(maxColumns, numColumns);
  for (const tableRow of tableRows) {
    const { customStyle, splitLyrics } = tableRow;
    let lyricRow: string[];
    if (splitLyrics.length === 1) {
      let sharedRow = splitLyrics[0];
      if (sharedRow.match(rxIsWholeStringNewline)) {
        lyricRow = [customStyle];
        for (let j = 0; j < numColumns; j++) {
          lyricRow.push('');
        }
        lyrics.push(lyricRow);
      } else if (sharedRow.match(rxCheckSharedColumn)) {
        sharedRow = sharedRow.replace(rxCheckSharedColumn, '');
        lyricRow = [customStyle];
        for (let j = 0; j < numColumns; j++) {
          lyricRow.push(sharedRow);
        }
        lyrics.push(lyricRow);
      } else {
        lyricRow = [customStyle, splitLyrics[0] || ''];
        for (let j = 1; j < numColumns; j++) {
          lyricRow.push('');
        }
        lyrics.push(lyricRow);
      }
    } else {
      lyricRow = [customStyle];
      for (let j = 0; j < numColumns; j++) {
        lyricRow.push(splitLyrics[j] || '');
      }
      lyrics.push(lyricRow);
    }
  }
  
  return [lyrics, numColumns];
}

/**
 * 
 * @param tableHeaders 
 * @param lyricsData 
 * @returns 
 */
export function buildLyricsTable(tableHeaders: string, lyricsData: string[][]): string {
  let sb: string[] = [tableHeaders + "\n"];
  for (const lyricsRow of lyricsData) {
    sb.push("|-");
    const customStyle = (lyricsRow[0] || '').trim();
    if (customStyle !== '') {
      sb.push(`style=\"${customStyle}\"`);
    }
    sb.push("\n");
    let isShared = (lyricsRow.length > 2);	// isShared = true unless if there's only one lyrics column
    const firstCell = (lyricsRow[1] || '').trim();
    for (let j = 2; j < lyricsRow.length; j++) {
      if ((lyricsRow[j] || '').trim() !== firstCell) {
        isShared = false;
        break;
      }
    }
    if ((isShared || lyricsRow.length === 2) && firstCell === '') {
      sb.push("|<br />\n");
    } else if (isShared) {
      sb.push(`| {{shared}} ${firstCell}\n`);
    } else {
      for (let j = 1; j < lyricsRow.length; j++) {
        sb.push("|" + 
          (lyricsRow[j] || '')
            .replace(/^-/, "<nowiki>-</nowiki>")
            .replace(/(?<!<nowiki>)(~{3,})(?!<\/nowiki>)/g, '<nowiki>$1</nowiki>') + "\n"
        );
      }
    }
  }
  sb.push("|}");
  return sb.join('');
}