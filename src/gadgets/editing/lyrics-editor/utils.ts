export const rxMatchBolded = /^\s*('{3})(.*)\1\s*$/;
export const rxMatchBoldedCss = /font-weight\s*:\s*bold\b\s*;*/;
export const rxMatchItalicised = /^\s*('{2})((?<=\1)(?:(?!')|'{3}(?!')).*(?:(?<!')|(?<!')'{3})(?=\1))\1\s*$/;
export const rxMatchItalicisedCss = /font-style\s*:\s*italic\b\s*;*/;
export const rxLyricsTableWikitext = /(\{\|\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]table[ _]class\}\}\s*\n\|-\s*class\s*=\s*["'][^\n]*\blyrics-table-header\b[^\n]*["']\s*\n!\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]header\}\})\s*\n([^]*?\|\})/g;
export const rxLyricsTableRow = /\|-(.*?)\n([^]*?)\n(?=\|-|\|\})/g;
export const rxInlineCssStyle = /style\s*=\s*["']\s*([^\n]*?)\s*;*\s*["']/;
export const rxCheckSharedColumn = /^\s*(\{\{(?:[Tt]emplate:|)shared[^\}]*\}\}|colspan=\s*(?:["']|)\s*\d+\s*(?:["']|)\s*\|)/gi;
export const rxSplitTableRow = /(?<=\n\|).*?(?=\n\||$)/g;
export const rxIsWholeStringNewline = /^\s*<br\s*\/?\s*>\s*$/;

export function getWikipageTables(wikipageContents: string): RegExpExecArray[] {
  return Array.from(wikipageContents.matchAll(rxLyricsTableWikitext));
}

export function parseLyrics(tableBody: string, maxColumns: number): [string[][], number] {
  const lyrics: string[][] = [];
  let numColumns = 0; 
  const tableRows = Array.from(tableBody.matchAll(rxLyricsTableRow))
  .map(function (tableRow) {
    const contents = tableRow[0];
    let customStyle: RegExpMatchArray | string | null = tableRow[1].match(rxInlineCssStyle);
    customStyle = customStyle === null ? '' : customStyle[1]+';';
    const lines = "\n" + tableRow[2];
    const arrResults = lines.matchAll(rxSplitTableRow);
    const splitLyrics = Array.from(arrResults).map((res) => res[0]);
    numColumns = Math.max(numColumns, splitLyrics.length);
    return { contents, customStyle, splitLyrics };
  });
  numColumns = Math.min(maxColumns, numColumns);
  for (const tableRow of tableRows) {
    const customStyle = tableRow.customStyle;
    const splitLyrics = tableRow.splitLyrics;
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
            .replace(/(?<!<nowiki>)(~{4,})(?!<\/nowiki>)/g, '<nowiki>$1</nowiki>') + "\n"
        );
      }
    }
  }
  sb.push("|}");
  return sb.join('');
}