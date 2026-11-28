import { describe, expect, test } from "vitest";
import { extractLyricsTablesFromWikipageSrc } from "../src/lyricsEditor/utils/parseLyrics";
import { buildNewLyricsSegment } from "../src/lyricsEditor/utils/buildNewLyrics";

describe("buildNewLyricsSegment - assertions", () => {
  test("Excess rows should not be rendered", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    const translator = "";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`;
    expect(newTable).toBe(expected);
  });

  test("Line breaks should be rendered", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo"],
      ["", "", ""],
      ["", "", ""],
      ["", "かきくけこ", "kakikukeko"],
    ];
    const translator = "";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|<br />
|-
|<br />
|-
|かきくけこ
|kakikukeko
|}`;
    expect(newTable).toBe(expected);
  });
});

describe("buildNewLyricsSegment - purely adding", () => {
  test("Add a fanmade translation to a table without a translation", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}`;
    expect(newTable).toBe(expected);
  });

  test("Add an official translation to a table without a translation", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = true;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{OfficialEnglishNotify}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}`;
    expect(newTable).toBe(expected);
  });

  test("Add a fanmade translation with translation notes to a table without a translation", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG<ref>Part of the Japanese syllabary.</ref>"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>Part of the Japanese syllabary.</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}

==Translation Notes==
{{Reflist}}`;
    expect(newTable).toBe(expected);
  });

  test("Add a fanmade translation (by a translator with a license) to a table without a translation", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
    ];
    const translator = "CoolMikeHatsune22";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{TranslatorLicense|CoolMikeHatsune22}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|CoolMikeHatsune22}}`;
    expect(newTable).toBe(expected);
  });

  test("Add an official translation with translation notes to a table without a translation", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG<ref>Part of the Japanese syllabary.</ref>"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = true;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{OfficialEnglishNotify}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>Part of the Japanese syllabary.</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}

==Translation Notes==
{{Reflist}}`;
    expect(newTable).toBe(expected);
  });

  test("Add an official translation (by a translator with a license) to a table without a translation", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
    ];
    const translator = "CoolMikeHatsune22";
    const isOfficialTranslation = true;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{OfficialEnglishNotify}}
{{TranslatorLicense|CoolMikeHatsune22}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|CoolMikeHatsune22}}`;
    expect(newTable).toBe(expected);
  });

  test("Add singing parts to a table without singing parts", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji}}`;
    const lyricsData = [
      ["color: red;", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| border="1" cellpadding="4" style="border-collapse:collapse; border:1px groove; line-height:1.5"
!style="background-color:black; color:white;"|Singer
|<span style="color:red;">Singer</span>
|All
|}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|- style="color: red;"
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`;
    expect(newTable).toBe(expected);
  });

  test("Add a second fanmade translation to a table with an existing (fanmade) translation", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukekoHIJKLMN
|HIJKLMN
|}
{{translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English|eng2:Alt English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG", "YELLOW"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN", "MELLOW"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English|eng2:Alt English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|YELLOW
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|MELLOW
|}
{{Translator|John Doe}}`;
    expect(newTable).toBe(expected);
  });

  test("Add a second fanmade translation to a table with an existing (official) translation", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{OfficialEnglishNotify}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukekoHIJKLMN
|HIJKLMN
|}
{{translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English|eng2:Alt English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG", "YELLOW"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN", "MELLOW"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = true;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English|eng2:Alt English}}
{{OfficialEnglishNotify}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|YELLOW
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|MELLOW
|}
{{Translator|John Doe}}`;
    expect(newTable).toBe(expected);
  });

  test("Add a fourth and fifth column to a table", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukekoHIJKLMN
|HIJKLMN
|}
{{translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English|oas:Stockfish|bac:Bacchius}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG", "YELLOW", "12345"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN", "MELLOW", "67890"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = true;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English|oas:Stockfish|bac:Bacchius}}
{{OfficialEnglishNotify}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|YELLOW
|12345
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|MELLOW
|67890
|}
{{Translator|John Doe}}`;
    expect(newTable).toBe(expected);
  });
});

describe("buildNewLyricsSegment - removing", () => {
  test("Remove the English fanmade translation", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukekoHIJKLMN
|HIJKLMN
|}
{{translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
    ];
    const translator = "";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`;
    expect(newTable).toBe(expected);
  });

  test("Remove the official English translation", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{OfficialEnglishNotify}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukekoHIJKLMN
|HIJKLMN
|}
{{translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
    ];
    const translator = "";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`;
    expect(newTable).toBe(expected);
  });

  test("Remove the official English translation (forgot to uncheck)", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{OfficialEnglishNotify}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukekoHIJKLMN
|HIJKLMN
|}
{{translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
    ];
    const translator = "";
    const isOfficialTranslation = true;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`;
    expect(newTable).toBe(expected);
  });

  test("Remove the English fanmade translation (by only clearing the column)", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukekoHIJKLMN
|HIJKLMN
|}
{{translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`;
    expect(newTable).toBe(expected);
  });

  test("Remove the official English translation (by only clearing the column)", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{OfficialEnglishNotify}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukekoHIJKLMN
|HIJKLMN
|}
{{translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = true;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`;
    expect(newTable).toBe(expected);
  });

  test("Remove the original column", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|eng:English}}`;
    const lyricsData = [
      ["", "aiueo", "ABCDEFG"],
      ["", "kakikukeko", "HIJKLMN"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|aiueo
|ABCDEFG
|-
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}`;
    expect(newTable).toBe(expected);
  });

  test("Remove the romanized column", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "ABCDEFG"],
      ["", "かきくけこ", "HIJKLMN"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|ABCDEFG
|-
|かきくけこ
|HIJKLMN
|}
{{Translator|John Doe}}`;
    expect(newTable).toBe(expected);
  });

  test("Remove singing parts", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| border="1" cellpadding="4" style="border-collapse:collapse; border:1px groove; line-height:1.5"
!style="background-color:yellow; color:green;"|Singer
|<span style="color:red;">Hatsune Miku</span>
|All
|}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|- style="color: red;"
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
    ];
    const translator = "";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    // We expect that the old singing parts template is removed.
    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`;
    expect(newTable).toBe(expected);
  });
});

describe("buildNewLyricsSegment - replacing", () => {
  test("Replace lyrics on a table", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
      ["", "まみむめも", "mamimumemo"],
      ["", "さしすせそ", "sasisuseso"],
    ];
    const translator = "";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|-
|まみむめも
|mamimumemo
|-
|さしすせそ
|sasisuseso
|}`;
    expect(newTable).toBe(expected);
  });

  test("Replace a fanmade translation on a table", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "OPQRST"],
      ["", "かきくけこ", "kakikukeko", "UVWXYZ"],
    ];
    const translator = "Jane Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|OPQRST
|-
|かきくけこ
|kakikukeko
|UVWXYZ
|}
{{Translator|Jane Doe}}`;
    expect(newTable).toBe(expected);
  });

  test("Replace an official translation with a fanmade translation on a table", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{OfficialEnglishNotify}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "OPQRST"],
      ["", "かきくけこ", "kakikukeko", "UVWXYZ"],
    ];
    const translator = "Jane Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|OPQRST
|-
|かきくけこ
|kakikukeko
|UVWXYZ
|}
{{Translator|Jane Doe}}`;
    expect(newTable).toBe(expected);
  });

  test("Add translation notes to a fanmade translation on a table", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG<ref>Part of the Japanese syllabary.</ref>"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>Part of the Japanese syllabary.</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}

==Translation Notes==
{{Reflist}}`;
    expect(newTable).toBe(expected);
  });

  test("Edit translation notes on a fanmade translation", () => {
    // Old inputs
    const oldParts =
      extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>Part of the Japanese syllabary.</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}

==Translation Notes==
{{Reflist}}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo", "ABCDEFG<ref>The first part of the Japanese syllabary.</ref>"],
      ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
    ];
    const translator = "John Doe";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>The first part of the Japanese syllabary.</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}

==Translation Notes==
`;
    expect(newTable).toBe(expected);
  });

  test("Edit singing parts", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| border="1" cellpadding="4" style="border-collapse:collapse; border:1px groove; line-height:1.5"
!style="background-color:yellow; color:green;"|Singer
|<span style="color:red;">Hatsune Miku</span>
|All
|}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|- style="color: red;"
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji}}`;
    const lyricsData = [
      ["color: yellow;", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
    ];
    const translator = "";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    // We expect that the old singing parts template is replaced.
    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| border="1" cellpadding="4" style="border-collapse:collapse; border:1px groove; line-height:1.5"
!style="background-color:black; color:white;"|Singer
|<span style="color:yellow;">Singer</span>
|All
|}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|- style="color: yellow;"
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`;
    expect(newTable).toBe(expected);
  });

  test("Replace NSFW lyrics on a table", () => {
    // Old inputs
    const oldParts = extractLyricsTablesFromWikipageSrc(`{{lyrics toggle|jp:Japanese|rom:Romaji}}
<div class = "mw-collapsible mw-collapsed">
{{NSFWContent}} 
<div class="mw-collapsible-content">
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}
</div></div>`)[0];
    // New inputs
    const toggleText = `{{lyrics toggle|jp:Japanese|rom:Romaji}}`;
    const lyricsData = [
      ["", "あいうえお", "aiueo"],
      ["", "かきくけこ", "kakikukeko"],
      ["", "まみむめも", "mamimumemo"],
      ["", "さしすせそ", "sasisuseso"],
    ];
    const translator = "";
    const isOfficialTranslation = false;
    const newTable = buildNewLyricsSegment(oldParts, lyricsData, {
      toggleText,
      translator,
      isOfficialTranslation,
    });

    const expected = `{{lyrics toggle|jp:Japanese|rom:Romaji}}
<div class = "mw-collapsible mw-collapsed">
{{NSFWContent}} 
<div class="mw-collapsible-content">
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|-
|まみむめも
|mamimumemo
|-
|さしすせそ
|sasisuseso
|}`;
    expect(newTable).toBe(expected);
  });
});