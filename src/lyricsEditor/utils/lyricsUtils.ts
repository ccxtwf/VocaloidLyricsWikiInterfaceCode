import LANGUAGES from "./constants/languages";
import TRANSLATORS from "./constants/translators.json";
import { type ILyricsRow, type MultiSelectItem, LyricsTableHeader } from "./types";

export interface LanguageMetadata {
  headers: string[];
  needsRomanization: boolean;
  needsTranslation: boolean;
  isChinese: boolean;
  isoLangCode: string | null;
}

interface LyricsGenerationOptions {
  needsRomanization: boolean;
  needsTranslation: boolean;
  hasTranslation: boolean;
  showEnglishColumn: boolean;
}

interface LyricsGenerationOutput {
  toggle?: string;
  officialEngTemplate?: string;
  translatorLicenseTemplate?: string;
  singers?: string;
  lyrics: string;
  translatorTemplate?: string;
  translationNotes?: string;
}

/**
 *
 * @param languages
 * @returns
 */
export function getLanguageMetadata(languages: MultiSelectItem[]): LanguageMetadata {
  let headers: string[] = [];
  let needsRomanization = false;
  let needsTranslation = true;
  let isChinese = false;
  let isoLangCode = null;

  if (languages.length === 0) {
    return {
      headers: [LyricsTableHeader.ORIGINAL, LyricsTableHeader.ROMANIZED, LyricsTableHeader.ENGLISH],
      needsRomanization: true,
      needsTranslation: true,
      isChinese: false,
      isoLangCode: null,
    };
  }

  const ll = languages.map(({ value }) => LANGUAGES[value]);

  const originalLanguages =
    ll.length < 4 ? ll.map(({ name }) => name) : [LyricsTableHeader.ORIGINAL];
  needsRomanization = ll.some(({ transliteration }) => !!transliteration);
  needsTranslation = ll.some(({ name }) => {
    return name !== LyricsTableHeader.ENGLISH && name !== "Nonlexical";
  });
  isChinese = ll.some(({ isChinese }) => isChinese);
  isoLangCode = ll[0]?.iso || null;

  headers.push(originalLanguages.join("/"));

  if (needsRomanization) {
    const romanizationSystems = new Set<string>(
      ll.map(({ transliteration }) => transliteration).filter((el) => !!el) as Iterable<string>,
    );
    headers.push(
      (romanizationSystems.size < 4
        ? Array.from(romanizationSystems.keys())
        : [LyricsTableHeader.ROMANIZED]
      ).join("/"),
    );
  } else {
    headers.push("");
  }

  headers.push(needsTranslation ? LyricsTableHeader.ENGLISH : "");

  return { headers, needsRomanization, needsTranslation, isChinese, isoLangCode };
}

/**
 *
 * @param headers
 * @param needsRomanization
 * @param showEnglishColumn
 * @param isoLangCode
 * @returns
 */
export function generateLyricsToggle(
  headers: string[],
  needsRomanization: boolean,
  showEnglishColumn: boolean,
  isoLangCode?: string | null,
) {
  const lookupOriginalColumnSemanticId: Record<string, string> = {
    Japanese: "jp",
    Mandarin: "cn",
    Korean: "kr",
    Cantonese: "yue",
    Spanish: "sp",
    Portuguese: "pt",
    Indonesian: "id",
    French: "fr",
    German: "de",
    Russian: "ru",
  };
  const lookupRomanizedColumnSemanticId: Record<string, string> = {
    Romanized: "rom",
    Romaji: "rom",
    Romaja: "rom",
    Pinyin: "py",
  };
  const skipCustomLangIsoCode: Record<string, string> = {
    Japanese: "ja",
    Mandarin: "zh-Hans",
    Korean: "ko",
    Cantonese: "zh-Hant",
    Spanish: "es",
    Portuguese: "pt",
    Indonesian: "id",
    French: "fr",
    German: "de",
    Russian: "ru",
  };

  let res = "{{lyrics toggle|";
  const [org, rom, eng] = headers;
  res += `${lookupOriginalColumnSemanticId[org] || "org"}:${org}`;
  if (needsRomanization) {
    res += `|${lookupRomanizedColumnSemanticId[rom] || "rom"}:${rom}`;
  }
  if (showEnglishColumn) {
    res += `|eng:${eng}`;
  }
  if (
    !(headers[0] in skipCustomLangIsoCode) ||
    (isoLangCode && skipCustomLangIsoCode[headers[0]] !== isoLangCode)
  ) {
    res += `|iso-lang=${isoLangCode ?? ""}`;
  }
  res += "}}";
  return res;
}

/**
 *
 * @param contents
 * @returns
 */
export function renderTableCellWikitext(contents?: string): string {
  return `|${(contents || "")
    .replace(/^-/, "<nowiki>-</nowiki>")
    .replace(/(?<!<nowiki>|~)(~{3,})(?!~|<\/nowiki>)/g, "<nowiki>$1</nowiki>")}\n`;
}

/**
 *
 * @param lyrics
 * @param param1
 * @returns
 */
export function renderLyricsRowWikitext(
  lyrics: ILyricsRow,
  {
    needsRomanization,
    needsTranslation,
    hasTranslation,
    showEnglishColumn,
  }: LyricsGenerationOptions,
) {
  let {
    customStyle = "",
    original = "",
    romanized = "",
    english = "",
    additionalColumns = [],
  } = lyrics;

  let wikitext: string = `|-${customStyle ? ` style="${customStyle}"` : ""}\n`;

  /**
   * Merge the cells if:
   *  - The lyrics are in need of romanization & translation (with no additional columns),
   *    and the original, romanized, and English translation share the same text
   *  - The lyrics are in need of romanization & translation (with no additional columns &
   *    no translation), and the original and romanized columns share the same text
   *  - The lyrics are in need of translation but not romanization (with no additional columns)
   *    and the original and English translation share the same text
   *  - When additional columns are supplied, all additional columns must share the same text
   *    as the original
   *
   * Do not merge the cells if:
   *  - The current row is a line break (shared <br />)
   *  - There is only one column available
   */
  const compareCells = [
    original,
    ...(needsRomanization ? [romanized] : []),
    ...(needsTranslation && hasTranslation ? [english] : []),
    ...additionalColumns,
  ];
  let isLineBreak = false;
  const areColumnsShared = compareCells.every((s) => s === original);
  if (areColumnsShared && !original) {
    isLineBreak = true;
  }

  if (isLineBreak) {
    wikitext += "|<br />\n";
  } else if (areColumnsShared && compareCells.length > 1) {
    wikitext += `| {{shared}} ${original}\n`;
  } else {
    wikitext += renderTableCellWikitext(original);
    if (needsRomanization) {
      wikitext += renderTableCellWikitext(romanized);
    }
    if (showEnglishColumn || (needsTranslation && hasTranslation)) {
      wikitext += renderTableCellWikitext(english);
    }
    if (additionalColumns.length) {
      for (const additionalColumn of additionalColumns) {
        wikitext += renderTableCellWikitext(additionalColumn);
      }
    }
  }
  return wikitext;
}

/**
 * Create wikitable containing the original, romanized, and English translated lyrics
 *
 * @param lyrics
 */
export function generateLyricsTable(
  lyrics: ILyricsRow[],
  options: LyricsGenerationOptions,
): string {
  return `{| {{lyrics table class}}\n|- class="lyrics-table-header"\n! {{lyrics header}}\n${lyrics
    .map((lyric) => renderLyricsRowWikitext(lyric, options))
    .join("")}|}`;
}

/**
 * Generate the wikitext for the informational table showing who's singing which part
 *
 * @param usedColours
 * @param bgColour
 * @param fgColour
 * @returns
 */
export function generateSingerPartsElement(
  usedColours: Set<string>,
  bgColour: string,
  fgColour: string,
): string {
  let hasMultipleSingerLines = usedColours.has("");
  if (hasMultipleSingerLines) {
    usedColours.delete("");
  }
  let singerTabs = [...usedColours]
    .map((el) => `|<span style="color:${el};">Singer</span>\n`)
    .join("");
  if (hasMultipleSingerLines) {
    singerTabs += "|All\n";
  }
  return `{| border="1" cellpadding="4" style="border-collapse:collapse; border:1px groove; line-height:1.5"\n!style="background-color:${bgColour}; color:${fgColour};"|Singer\n${
    singerTabs
  }|}`;
}

/**
 * Create &lt;poem&gt; element
 *
 * @param lyrics
 * @returns
 */
export function generateLyricsPoemElement(lyrics: ILyricsRow[]): string {
  let res: string = "";

  let prevLyrics: ILyricsRow | null = null;
  const arrSpans: { contents: string; customStyle: string | null }[] = [];
  let curSpan: { contents: string; customStyle: string | null } = {
    contents: "",
    customStyle: null,
  };

  for (const lyric of lyrics) {
    // Skip line breaks
    if (!lyric.original) {
      curSpan.contents += "\n";
      continue;
    }
    // Add to array of spans to take note of when a change in text colour is detected
    if (prevLyrics !== null && lyric.customStyle !== prevLyrics.customStyle) {
      arrSpans.push(curSpan);
      curSpan = { contents: "", customStyle: null };
    }
    if (lyric.customStyle !== "") {
      curSpan.customStyle = lyric.customStyle;
    }
    // Store current line
    curSpan.contents += lyric.original + "\n";
    // Save lyrics to be compared
    prevLyrics = lyric;
  }
  arrSpans.push(curSpan);

  res += `<poem>${arrSpans
    .map(({ contents, customStyle }) => {
      contents = contents.replace(/\n$/, "");
      if (customStyle !== null) {
        const m = contents.match(/\n+$/);
        contents = `<span style="${customStyle}">${contents.trimEnd()}</span>${m ? m[0] : ""}`;
      }
      return contents;
    })
    .join("\n")}</poem>`;
  return res;
}

/**
 *
 * @param s
 * @returns
 */
export function wrapNsfwTemplate(s: string): string {
  return `<div class = "mw-collapsible mw-collapsed">
{{NSFWContent}} 
<div class="mw-collapsible-content">
${s}
</div></div>`;
}

export function generateLyricsSegmentAsDataObject(
  lyricsRows: ILyricsRow[],
  {
    headers,
    needsRomanization,
    needsTranslation,
    showEnglishColumn = false,
    isoLangCode,
    translator,
    isOfficialTranslation = false,
    bgColour = "black",
    fgColour = "white",
    createToggleElement = true,
  }: {
    headers?: string[];
    needsRomanization: boolean;
    needsTranslation: boolean;
    showEnglishColumn?: boolean;
    isoLangCode?: string | null;
    translator?: string;
    isOfficialTranslation?: boolean;
    bgColour?: string;
    fgColour?: string;
    createToggleElement?: boolean;
  },
): LyricsGenerationOutput {
  const res: LyricsGenerationOutput = { lyrics: "" };

  const outputAsWikiTable = needsRomanization || needsTranslation;
  const hasTranslation = lyricsRows.some((lyricRow) => !!lyricRow.english);
  showEnglishColumn = showEnglishColumn || (needsTranslation && hasTranslation);

  let showNotes: boolean = false;
  let isTranslationNote: boolean | null = null;

  const rxRefTag = /<ref(?:[^>]*)>/;
  const rxSpanInlineColour =
    /<span\s+style\s*=\s*["'][^>]*color\s*:\s*([a-zA-Z0-9#]+)\s*[^>]*["']>.*?<\/span>/gm;
  let usedColours: Set<string> = new Set();

  for (const lyricsRow of lyricsRows) {
    let detectedRowColour = lyricsRow.customStyle.match(/color\s*:\s*([#0-9a-zA-Z]+);?/);
    if (!detectedRowColour) {
      usedColours.add("");
    } else {
      usedColours.add(detectedRowColour[1]);
    }
    const detectedInlineColours = lyricsRow.original.matchAll(rxSpanInlineColour);
    for (let [_, colour] of detectedInlineColours) {
      usedColours.add(colour);
    }
    if (lyricsRow.original.match(rxRefTag) || (lyricsRow?.romanized || "").match(rxRefTag)) {
      showNotes = true;
      isTranslationNote = isTranslationNote || false;
    } else if (hasTranslation && (lyricsRow?.english || "").match(rxRefTag)) {
      showNotes = true;
      isTranslationNote = true;
    }
  }

  if (createToggleElement && (needsRomanization || needsTranslation)) {
    // Lyrics toggle & column headers definition
    res.toggle = generateLyricsToggle(
      headers || [],
      needsRomanization,
      showEnglishColumn,
      isoLangCode,
    );
  }

  if (outputAsWikiTable && hasTranslation && isOfficialTranslation) {
    res.officialEngTemplate = "{{OfficialEnglishNotify}}";
  }

  // Translator license
  const referLicense = translator ? TRANSLATORS.find(({ name }) => name === translator) : null;
  if (referLicense) {
    res.translatorLicenseTemplate = `{{TranslatorLicense|${referLicense.name}}}`;
  }

  // Singer coloured lines
  if (usedColours.size > 1) {
    res.singers = generateSingerPartsElement(usedColours, bgColour, fgColour);
  }

  if (outputAsWikiTable) {
    res.lyrics = generateLyricsTable(lyricsRows, {
      needsRomanization,
      needsTranslation,
      hasTranslation,
      showEnglishColumn,
    });
    if (hasTranslation && (!isOfficialTranslation || translator !== "")) {
      res.translatorTemplate = `{{Translator|${translator || "Anonymous"}}}`;
    }
  } else {
    res.lyrics = generateLyricsPoemElement(lyricsRows);
  }

  // Lyrics/Translation Notes
  if (showNotes) {
    res.translationNotes = `\n==${isTranslationNote ? "Translation " : ""}Notes==\n{{Reflist}}`;
  }

  return res;
}

/**
 *
 * @param lyrics
 * @param options
 * @returns
 */
export function generateLyricsSegment(
  lyricsRows: ILyricsRow[],
  {
    headers,
    needsRomanization,
    needsTranslation,
    showEnglishColumn = false,
    isoLangCode,
    translator,
    isOfficialTranslation = false,
    bgColour,
    fgColour,
    toggleElement,
    isNsfw,
  }: {
    headers?: string[];
    needsRomanization: boolean;
    needsTranslation: boolean;
    showEnglishColumn?: boolean;
    isoLangCode?: string | null;
    translator?: string;
    isOfficialTranslation?: boolean;
    bgColour?: string;
    fgColour?: string;
    toggleElement?: string;
    isNsfw?: boolean;
  },
): string {
  const {
    lyrics,
    toggle,
    singers,
    officialEngTemplate,
    translatorLicenseTemplate,
    translatorTemplate,
    translationNotes,
  } = generateLyricsSegmentAsDataObject(lyricsRows, {
    headers,
    needsRomanization,
    needsTranslation,
    showEnglishColumn,
    isoLangCode,
    translator,
    isOfficialTranslation,
    bgColour,
    fgColour,
    createToggleElement: !toggleElement,
  });
  const res = [
    toggle ?? toggleElement,
    officialEngTemplate,
    translatorLicenseTemplate,
    singers,
    lyrics,
    translatorTemplate,
    translationNotes,
  ].reduce((s: string, part: string | undefined) => {
    if (part) {
      if (s) s += "\n";
      s += part;
    }
    return s;
  }, "") as string;
  return isNsfw ? wrapNsfwTemplate(res) : res;
}

/**
 * Determine column headers from the given toggle template wikitext
 *
 * e.g. {{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}} ->
 *      ['Japanese', 'Romaji', 'English']
 *
 * @param toggleText
 */
export function determineColumnHeaders(toggleText: string): string[] {
  const res: string[] = [];
  const components = toggleText
    .trim()
    .matchAll(/(?<=^\{\{[Ll]yrics[_ ]toggle\s*\||\|).*?(?=\||\}\}$)/g);
  for (const component of components) {
    const [a, ...b] = component[0].split(":");
    res.push(b.length ? b.join(":") : a);
  }
  return res;
}

const rxLyricsToggleTemplateComponents =
  /((?<=^\{\{)[Ll]yrics[_ ]toggle|(?<=\|)[^|]*?(?=\||\}\}$))/g;

/**
 * Inserts column(s) at the specified index in the {{lyrics toggle}} template
 *
 * @param toggleText
 * @param index
 * @param amount
 * @returns
 */
export function addColumnsAtIndexToTheLeftToToggle(
  toggleText: string,
  index: number,
  amount: number,
): string {
  DEBUG && console.log("addColumnsAtIndexToTheLeftToToggle", toggleText, index, amount);
  const oldComponents = Array.from(toggleText.matchAll(rxLyricsToggleTemplateComponents)).map(
    ([a, ..._b]) => a,
  );
  if (oldComponents.length === 0) {
    oldComponents.push("lyrics toggle");
  }
  const newComponents = [
    ...oldComponents.slice(0, index),
    ...Array(amount)
      .fill(null)
      .map((_, idx) => `col${idx + 1}:Column ${idx + 1}`),
    ...oldComponents.slice(index, oldComponents.length),
  ];
  return "{{" + newComponents.join("|") + "}}";
}

/**
 * Inserts column(s) at the specified index in the {{lyrics toggle}} template
 *
 * @param toggleText
 * @param index
 * @param amount
 * @returns
 */
export function addColumnsAtIndexToTheRightToToggle(
  toggleText: string,
  index: number,
  amount: number,
): string {
  DEBUG && console.log("addColumnsAtIndexToTheRightToToggle", toggleText, index, amount);
  return addColumnsAtIndexToTheLeftToToggle(toggleText, index + 1, amount);
}

/**
 * Removes column(s) at the specified indices in the {{lyrics toggle}} template
 *
 * @param toggleText
 * @param columnIndices
 * @returns
 */
export function removeColumnsAtIndexFromToggle(
  toggleText: string,
  columnIndices: number[],
): string {
  DEBUG && console.log("removeColumnsAtIndexFromToggle", toggleText, columnIndices);
  const oldComponents = Array.from(toggleText.matchAll(rxLyricsToggleTemplateComponents)).map(
    ([a, ..._b]) => a,
  );
  const newComponents = oldComponents.filter((_, idx) => columnIndices.indexOf(idx) < 0);
  return "{{" + newComponents.join("|") + "}}";
}

/**
 *
 * @param lyrics
 * @returns
 */
export function truncateLyrics(lyrics: ILyricsRow[]): ILyricsRow[] {
  let truncateLyricsAtIndex = lyrics.length;
  while (truncateLyricsAtIndex >= 0) {
    if (lyrics[--truncateLyricsAtIndex]?.original) {
      break;
    }
  }
  return lyrics.slice(0, truncateLyricsAtIndex + 1);
}

/**
 * Convert Lyrics data stored in Handsontable instances into more scrutable entities.
 *
 * @param headers
 * @param data
 * @returns
 */
export function mapHandsontableLyricsData<T extends ILyricsRow = ILyricsRow>(
  headers: string[],
  data: unknown[][],
  constructor?: new (...args: any[]) => T,
): [T[], boolean] {
  const i = headers.findIndex((h) => h.includes(LyricsTableHeader.ENGLISH));
  let needsRomanization = true;
  const t = data.map((row) => {
    let [customStyle, original, ...c] = row;
    let romanized: string | undefined;
    let english: string | undefined;
    let offset: number = 0;
    switch (i) {
      case -1:
        // English column not found
        if (c.length) {
          romanized = (c[0] as string) || "";
          offset = 1;
        }
        break;
      case 1:
        // Found English at second column
        english = (c[0] as string) || "";
        needsRomanization = false;
        offset = 1;
        break;
      default:
        // Ideally, the English column would be at the third column
        // No guarantee is made
        romanized = (c[0] as string) || "";
        english = (c[1] as string) || "";
        offset = 2;
        break;
    }

    const o = {
      customStyle: (customStyle as string) || "",
      original: (original as string) || "",
      romanized,
      english,
      additionalColumns: c.slice(offset).map((e) => (e as string) || ""),
    };
    return constructor ? new constructor(o) : (o as T);
  });
  return [t, needsRomanization];
}