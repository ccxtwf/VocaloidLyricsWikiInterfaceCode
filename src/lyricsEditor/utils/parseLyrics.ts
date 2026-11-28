/**
 * Parse the lyrics from the given wikipage string.
 *
 * @param wikipageContents
 */
export function extractLyricsTablesFromWikipageSrc(wikipageContents: string): RegExpMatchArray[] {
  const rx =
    /(?<toggle>\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]toggle[^}]+\}\})(?<moreNotifs>.*?)(?<lyricsTable>(?:\{\|\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]table[ _]class\}\}\s*\n\|-\s*class\s*=\s*["'][^\n]*\blyrics-table-header\b[^\n]*["']\s*\n!\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]header\}\})\s*\n(?<rows>.*?)\|\})\s*(?<translatorTemplate>\{\{(?:[Tt]emplate:|)[Tt]ranslator\|(?<translator>[^}]*)\}\}|)(?<append>.*?\|-\||.*?<\/tabber>|.*?={2,}[^\n]+={2,}\s*|)/gs;
  return Array.from(wikipageContents.matchAll(rx));
}

/**
 * Parse the lyrics from the supplied RegExpMatchArray object provided by `extractLyricsTablesFromWikipageSrc`.
 *
 * @param rxResults
 * @returns
 */
export function parseLyrics(rxResults: RegExpMatchArray): {
  toggleText: string;
  lyrics: string[][];
  translator: string | null;
  isOfficialTranslation: boolean;
} {
  const toggleText = rxResults.groups!.toggle;
  const nColumns = Array.from(toggleText.matchAll(/\|/g)).length;

  let translator = rxResults.groups!.translator ?? "";

  const isOfficialTranslation =
    rxResults.groups!.moreNotifs.match(/\{\{[Oo]fficialEnglishNotify[^}]*\}\}/) !== null;

  const lyrics: string[][] = [];
  const tblRows = rxResults.groups!.rows.matchAll(
    /\|- *(?<style>.*?)\n(?<cells>[^]*?)\n(?=\|-|$)/g,
  );
  for (const row of tblRows) {
    const ms = row.groups!.style.match(/style\s*=\s*["']\s*([^\n]*?)\s*;*\s*["']/);
    const customStyle = ms ? ms[1] + ";" : "";
    const cells = Array.from(row.groups!.cells.matchAll(/(?<=\n\||^\|).*?(?=\n\||$)/g));
    const a: string[] = [];
    for (const cell of cells) {
      let cellContents = cell[0] || "";
      if (cells.length === 1 && cellContents.match(/<br\s*\/?>/)) {
        a.push(...Array(nColumns).fill(""));
        break;
      }
      const msh = cellContents.match(
        /^\s*(\{\{(?:[Tt]emplate:|)[Ss]hared(?:\s*\|\s*(?<colspan>\d+)\s*|\s*)\}\}|colspan=\s*(?:["']|)\s*(?<colspan>\d+)\s*(?:["']|)[^\n]*?\|)\s*/,
      );
      if (msh) {
        let repeat = nColumns - a.length;
        if (msh.groups!.colspan) {
          repeat = Math.min(repeat, +msh.groups!.colspan);
        }
        cellContents = cellContents.replace(msh[0], "");
        a.push(...Array(repeat).fill(cellContents));
      } else {
        a.push(cellContents);
      }
      if (a.length >= nColumns) {
        break;
      }
    }
    lyrics.push([customStyle, ...a]);
  }

  return {
    toggleText,
    lyrics,
    translator,
    isOfficialTranslation,
  };
}