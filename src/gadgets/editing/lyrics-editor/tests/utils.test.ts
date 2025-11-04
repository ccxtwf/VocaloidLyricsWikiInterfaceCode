/**
 * Run tests on Command Line:
 * npx jest src/gadgets/editing/lyrics-editor/tests/utils.test.ts
 *  
 */ 
import { 
  getWikipageTables, 
  parseLyrics, 
  buildLyricsTable,
  rxMatchBolded,
  rxMatchItalicised,
} from "../utils.js";
import { 
  sampleWikitext1, expectedParsedTables1,
  sampleWikitext2, expectedParsedTables2,
  sampleWikitext3, expectedParsedTables3,
  sampleWikitext4, expectedParsedTables4,
  sampleWikitext5, expectedParsedTables5,
  sampleWikitext6, expectedParsedTables6,
  sampleWikitext7, expectedParsedTables7,
} from "./test-data-pages.js";
import { 
  table1, table2, table3, table4, table5, table6, table7,
  expectedLyrics1, expectedLyrics2, expectedLyrics3, 
  expectedLyrics4, expectedLyrics5, expectedLyrics6,
  expectedLyrics7 
} from "./test-data-tables.js";
import {
  lyricsHeader, lyricsData1, lyricsData2, expectedOutput1, expectedOutput2
} from "./test-build-lyrics.js";

describe('should get all wikipage tables correctly', () => {
  test('case 1', () => {
    const res = getWikipageTables(sampleWikitext1);
    expect(res.map(([fm, header, body]: RegExpExecArray) => ([fm, header, body]))).toEqual(expectedParsedTables1);
  });
  test('case 2', () => {
    const res = getWikipageTables(sampleWikitext2);
    expect(res.map(([fm, header, body]: RegExpExecArray) => ([fm, header, body]))).toEqual(expectedParsedTables2);
  });
  test('case 3', () => {
    const res = getWikipageTables(sampleWikitext3);
    expect(res.map(([fm, header, body]: RegExpExecArray) => ([fm, header, body]))).toEqual(expectedParsedTables3);
  });
  test('case 4', () => {
    const res = getWikipageTables(sampleWikitext4);
    expect(res.map(([fm, header, body]: RegExpExecArray) => ([fm, header, body]))).toEqual(expectedParsedTables4);
  });
  test('case 5', () => {
    const res = getWikipageTables(sampleWikitext5);
    expect(res.map(([fm, header, body]: RegExpExecArray) => ([fm, header, body]))).toEqual(expectedParsedTables5);
  });
  test('case 6', () => {
    const res = getWikipageTables(sampleWikitext6);
    expect(res.map(([fm, header, body]: RegExpExecArray) => ([fm, header, body]))).toEqual(expectedParsedTables6);
  });
  test('case 7', () => {
    const res = getWikipageTables(sampleWikitext7);
    expect(res.map(([fm, header, body]: RegExpExecArray) => ([fm, header, body]))).toEqual(expectedParsedTables7);
  });
});

describe('should get all lyrics data correctly', () => {
  const maxColumns = 5;
  test('case 1', () => {
    const res = parseLyrics(table1, maxColumns);
    expect(res[1]).toEqual(expectedLyrics1[1]);
    expect(res[0]).toEqual(expectedLyrics1[0]);
  });
  test('case 2', () => {
    const res = parseLyrics(table2, maxColumns);
    expect(res[1]).toEqual(expectedLyrics2[1]);
    expect(res[0]).toEqual(expectedLyrics2[0]);
  });
  test('case 3', () => {
    const res = parseLyrics(table3, maxColumns);
    expect(res[1]).toEqual(expectedLyrics3[1]);
    expect(res[0]).toEqual(expectedLyrics3[0]);
  });
  test('case 4', () => {
    const res = parseLyrics(table4, maxColumns);
    expect(res[1]).toEqual(expectedLyrics4[1]);
    expect(res[0]).toEqual(expectedLyrics4[0]);
  });
  test('case 5', () => {
    const res = parseLyrics(table5, maxColumns);
    expect(res[1]).toEqual(expectedLyrics5[1]);
    expect(res[0]).toEqual(expectedLyrics5[0]);
  });
  test('case 6', () => {
    const res = parseLyrics(table6, maxColumns);
    expect(res[1]).toEqual(expectedLyrics6[1]);
    expect(res[0]).toEqual(expectedLyrics6[0]);
  });
  test('successfully limit based on max columns of 5', () => {
    const res = parseLyrics(table7, maxColumns);
    expect(res[1]).toEqual(expectedLyrics7[1]);
    expect(res[0]).toEqual(expectedLyrics7[0]);
  });
});

describe('should build lyrics wikitable correctly', () => {
  test('case 1', () => {
    const res = buildLyricsTable(lyricsHeader, lyricsData1);
    expect(res).toEqual(expectedOutput1);
  });
  test('case 2', () => {
    const res = buildLyricsTable(lyricsHeader, lyricsData2);
    expect(res).toEqual(expectedOutput2);
  });
})

describe('regex should match bolded wikitext', () => {
  test('expected cases', () => {
    let m: RegExpMatchArray | null;
    m = "'''bolded text'''".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe('bolded text');
    m = "            '''bolded text'''".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe('bolded text');
    m = "'''bolded text'''        ".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe('bolded text');
    m = "'''bolded text  '''".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe('bolded text  ');
    m = "'''  bolded text'''".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe('  bolded text');
    m = "''' bolded text '''".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe(' bolded text ');
  });
  test('bolded & italicized text', () => {
    const m = "'''''bolded text'''''".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("''bolded text''");
  });
  test('match text in <b>', () => {
    let m: RegExpMatchArray | null;
    m = "<b>bolded text</b>".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("bolded text");
    m = "<b> bolded text </b>".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe(" bolded text ");
    m = "  <b>bolded text</b>  ".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("bolded text");
  });
  test('abnormal case 1', () => {
    const m = "'' 'normal text'''".match(rxMatchBolded);
    expect(m).toBeNull();
  });
  test('abnormal case 2', () => {
    const m = "non-bolded text '''bolded text'''".match(rxMatchBolded);
    expect(m).toBeNull();
  });
  test('false positive, ignore anyway', () => {
    const m = "'''''emphasized text''''' '''bolded text'''".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("''emphasized text''''' '''bolded text");
  });
  test('false positive, ignore anyway', () => {
    const m = "'''bolded text''' some text'''".match(rxMatchBolded);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("bolded text''' some text");
  });
});

describe('regex should match italicized wikitext', () => {
  test('expected cases', () => {
    let m: RegExpMatchArray | null;
    m = "''italicized text''".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe('italicized text');
    m = "            ''italicized text''".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe('italicized text');
    m = "''italicized text''        ".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe('italicized text');
    m = "''italicized text  ''".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe('italicized text  ');
    m = "''  italicized text''".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe('  italicized text');
    m = "'' italicized text ''".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe(' italicized text ');
  });
  test('bolded & italicized text', () => {
    const m = "'''''italicized text'''''".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("'''italicized text'''");
  });
  test('match text in <i>', () => {
    let m: RegExpMatchArray | null;
    m = "<i>italicised text</i>".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("italicised text");
    m = "<i>  italicised text  </i>".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("  italicised text  ");
    m = "  <i>italicised text</i>  ".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("italicised text");
  });
  test('abnormal case 1', () => {
    const m = "' 'normal text''".match(rxMatchItalicised);
    expect(m).toBeNull();
  });
  test('abnormal case 2', () => {
    const m = "non-italicized text ''italicized text''".match(rxMatchItalicised);
    expect(m).toBeNull();
  });
  test('false positive, ignore anyway', () => {
    const m = "'''''emphasized text''''' ''italicised text''".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("'''emphasized text''''' ''italicised text");
  });
  test('false positive, ignore anyway', () => {
    const m = "''italicised text'' some text''".match(rxMatchItalicised);
    expect(m).not.toBeNull();
    expect(m![2]).toBe("italicised text'' some text");
  });
});