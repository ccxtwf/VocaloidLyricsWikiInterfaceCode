import { describe, expect, test } from "vitest";
import { generateLyricsSegmentAsDataObject } from "../src/lyricsEditor/utils/lyricsUtils";
import type { ILyricsRow } from "../src/lyricsEditor/utils/types";

describe("generateLyricsSegmentAsDataObject - non-English songs with translation", () => {
  test("Japanese song with fanmade translation", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo", english: "ABCDEFG" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko", english: "HIJKLMN" },
    ];
    const options = {
      headers: ["Japanese", "Romaji", "English"],
      needsRomanization: true,
      needsTranslation: true,
      isoLangCode: "ja",
      translator: "John Doe",
      isOfficialTranslation: false,
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
      lyrics: `{| {{lyrics table class}}
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
|}`,
      translatorTemplate: "{{Translator|John Doe}}",
    };

    expect(res).toStrictEqual(expected);
  });

  test("Japanese song with translation by anonymous", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo", english: "ABCDEFG" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko", english: "HIJKLMN" },
    ];
    const options = {
      headers: ["Japanese", "Romaji", "English"],
      needsRomanization: true,
      needsTranslation: true,
      isoLangCode: "ja",
      translator: "",
      isOfficialTranslation: false,
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
      lyrics: `{| {{lyrics table class}}
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
|}`,
      translatorTemplate: "{{Translator|Anonymous}}",
    };
    expect(res).toStrictEqual(expected);
  });

  test("Japanese song with official translation", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo", english: "ABCDEFG" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko", english: "HIJKLMN" },
    ];
    const options = {
      headers: ["Japanese", "Romaji", "English"],
      needsRomanization: true,
      needsTranslation: true,
      isoLangCode: "ja",
      translator: "John Doe",
      isOfficialTranslation: true,
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
      officialEngTemplate: "{{OfficialEnglishNotify}}",
      lyrics: `{| {{lyrics table class}}
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
|}`,
      translatorTemplate: "{{Translator|John Doe}}",
    };
    expect(res).toStrictEqual(expected);
  });

  test("Japanese song with official translation by anonymous", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo", english: "ABCDEFG" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko", english: "HIJKLMN" },
    ];
    const options = {
      headers: ["Japanese", "Romaji", "English"],
      needsRomanization: true,
      needsTranslation: true,
      isoLangCode: "ja",
      translator: "",
      isOfficialTranslation: true,
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
      officialEngTemplate: "{{OfficialEnglishNotify}}",
      lyrics: `{| {{lyrics table class}}
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
|}`,
    };
    expect(res).toStrictEqual(expected);
  });

  test("Japanese song with translation notes", () => {
    const lyrics: ILyricsRow[] = [
      {
        customStyle: "",
        original: "あいうえお",
        romanized: "aiueo",
        english: "ABCDEFG<ref>This is a song about Japanese syllabaries</ref>",
      },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko", english: "HIJKLMN" },
    ];
    const options = {
      headers: ["Japanese", "Romaji", "English"],
      needsRomanization: true,
      needsTranslation: true,
      isoLangCode: "ja",
      translator: "John Doe",
      isOfficialTranslation: false,
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>This is a song about Japanese syllabaries</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`,
      translatorTemplate: "{{Translator|John Doe}}",
      translationNotes: "\n==Translation Notes==\n{{Reflist}}",
    };
    expect(res).toStrictEqual(expected);
  });

  test("Japanese song by a translator with a license", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo", english: "ABCDEFG" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko", english: "HIJKLMN" },
    ];
    const options = {
      headers: ["Japanese", "Romaji", "English"],
      needsRomanization: true,
      needsTranslation: true,
      isoLangCode: "ja",
      translator: "CoolMikeHatsune22",
      isOfficialTranslation: false,
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
      translatorLicenseTemplate: "{{TranslatorLicense|CoolMikeHatsune22}}",
      lyrics: `{| {{lyrics table class}}
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
|}`,
      translatorTemplate: "{{Translator|CoolMikeHatsune22}}",
    };
    expect(res).toStrictEqual(expected);
  });

  test("Japanese song with multiple singing parts", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "color:red;", original: "あいうえお", romanized: "aiueo", english: "ABCDEFG" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko", english: "HIJKLMN" },
    ];
    const options = {
      headers: ["Japanese", "Romaji", "English"],
      needsRomanization: true,
      needsTranslation: true,
      isoLangCode: "ja",
      translator: "John Doe",
      isOfficialTranslation: false,
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
      singers: `{| border="1" cellpadding="4" style="border-collapse:collapse; border:1px groove; line-height:1.5"
!style="background-color:black; color:white;"|Singer
|<span style="color:red;">Singer</span>
|All
|}`,
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|- style="color:red;"
|あいうえお
|aiueo
|ABCDEFG
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`,
      translatorTemplate: "{{Translator|John Doe}}",
    };

    expect(res).toStrictEqual(expected);
  });

  test("Indonesian song with fanmade translation", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "Bengawan Solo", english: "Solo River" },
      {
        customStyle: "",
        original: "Riwayatmu ini sedari dulu jadi",
        english: "As of now, your fate has",
      },
    ];
    const options = {
      headers: ["Indonesian", "", "English"],
      needsRomanization: false,
      needsTranslation: true,
      isoLangCode: "id",
      translator: "John Doe",
      isOfficialTranslation: false,
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|id:Indonesian|eng:English}}",
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|Bengawan Solo
|Solo River
|-
|Riwayatmu ini sedari dulu jadi
|As of now, your fate has
|}`,
      translatorTemplate: "{{Translator|John Doe}}",
    };
    expect(res).toStrictEqual(expected);
  });
});

describe("generateLyricsSegmentAsDataObject - non-English songs without translation", () => {
  test("Japanese song with no translation (column is hidden)", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko" },
    ];
    const options = {
      headers: ["Japanese", "Romaji", "English"],
      needsRomanization: true,
      needsTranslation: true,
      isoLangCode: "ja",
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji}}",
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`,
    };
    expect(res).toStrictEqual(expected);
  });

  test("Japanese song with no translation (but with a translator added in error)", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko" },
    ];
    const options = {
      headers: ["Japanese", "Romaji", "English"],
      needsRomanization: true,
      needsTranslation: true,
      isoLangCode: "ja",
      translator: "John Doe",
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji}}",
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`,
    };
    expect(res).toStrictEqual(expected);
  });

  test("Japanese song with no translation (column is shown)", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko" },
    ];
    const options = {
      headers: ["Japanese", "Romaji", "English"],
      needsRomanization: true,
      needsTranslation: true,
      showEnglishColumn: true,
      isoLangCode: "ja",
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|
|-
|かきくけこ
|kakikukeko
|
|}`,
    };
    expect(res).toStrictEqual(expected);
  });

  test("Indonesian song with no translation", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "Bengawan Solo" },
      {
        customStyle: "",
        original: "Riwayatmu ini sedari dulu jadi",
      },
    ];
    const options = {
      headers: ["Indonesian", "", "English"],
      needsRomanization: false,
      needsTranslation: true,
      isoLangCode: "id",
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|id:Indonesian}}",
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|Bengawan Solo
|-
|Riwayatmu ini sedari dulu jadi
|}`,
    };
    expect(res).toStrictEqual(expected);
  });

  test("Indonesian song with no translation (but with a translator added in error)", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "Bengawan Solo" },
      {
        customStyle: "",
        original: "Riwayatmu ini sedari dulu jadi",
      },
    ];
    const options = {
      headers: ["Indonesian", "", "English"],
      needsRomanization: false,
      needsTranslation: true,
      isoLangCode: "id",
      translator: "John Doe",
      bgColour: "black",
      fgColour: "white",
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      toggle: "{{lyrics toggle|id:Indonesian}}",
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|Bengawan Solo
|-
|Riwayatmu ini sedari dulu jadi
|}`,
    };
    expect(res).toStrictEqual(expected);
  });
});

describe("generateLyricsSegmentAsDataObject - use own toggle element", () => {
  test("3 columns", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo", english: "ABCDEFG" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko", english: "HIJKLMN" },
    ];
    const options = {
      headers: [],
      needsRomanization: true,
      needsTranslation: true,
      translator: "John Doe",
      isOfficialTranslation: false,
      bgColour: "black",
      fgColour: "white",
      createToggleElement: false,
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      lyrics: `{| {{lyrics table class}}
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
|}`,
      translatorTemplate: "{{Translator|John Doe}}",
    };
    expect(res).toStrictEqual(expected);
  });

  test("5 columns", () => {
    const lyrics: ILyricsRow[] = [
      {
        customStyle: "",
        original: "あいうえお",
        romanized: "aiueo",
        english: "ABCDEFG",
        additionalColumns: ["Eggs", "Bacon"],
      },
      {
        customStyle: "",
        original: "かきくけこ",
        romanized: "kakikukeko",
        english: "HIJKLMN",
        additionalColumns: ["Ham", "Cheese"],
      },
    ];
    const options = {
      headers: [],
      needsRomanization: true,
      needsTranslation: true,
      translator: "John Doe",
      isOfficialTranslation: false,
      bgColour: "black",
      fgColour: "white",
      createToggleElement: false,
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|Eggs
|Bacon
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|Ham
|Cheese
|}`,
      translatorTemplate: "{{Translator|John Doe}}",
    };
    expect(res).toStrictEqual(expected);
  });

  test("2 columns (no English)", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko" },
    ];
    const options = {
      headers: [],
      needsRomanization: true,
      needsTranslation: true,
      bgColour: "black",
      fgColour: "white",
      createToggleElement: false,
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`,
    };
    expect(res).toStrictEqual(expected);
  });

  test("2 columns (no English) (with a translator added in error)", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "あいうえお", romanized: "aiueo" },
      { customStyle: "", original: "かきくけこ", romanized: "kakikukeko" },
    ];
    const options = {
      headers: [],
      needsRomanization: true,
      needsTranslation: true,
      translator: "John Doe",
      bgColour: "black",
      fgColour: "white",
      createToggleElement: false,
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`,
    };
    expect(res).toStrictEqual(expected);
  });

  test("2 columns (with English)", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "Bengawan Solo", english: "Solo River" },
      {
        customStyle: "",
        original: "Riwayatmu ini sedari dulu jadi",
        english: "As of now, your fate has",
      },
    ];
    const options = {
      headers: [],
      needsRomanization: false,
      needsTranslation: true,
      translator: "John Doe",
      isOfficialTranslation: false,
      bgColour: "black",
      fgColour: "white",
      createToggleElement: false,
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|Bengawan Solo
|Solo River
|-
|Riwayatmu ini sedari dulu jadi
|As of now, your fate has
|}`,
      translatorTemplate: "{{Translator|John Doe}}",
    };
    expect(res).toStrictEqual(expected);
  });

  test("1 column (no English)", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "Bengawan Solo" },
      {
        customStyle: "",
        original: "Riwayatmu ini sedari dulu jadi",
      },
    ];
    const options = {
      headers: [],
      needsRomanization: false,
      needsTranslation: true,
      bgColour: "black",
      fgColour: "white",
      createToggleElement: false,
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|Bengawan Solo
|-
|Riwayatmu ini sedari dulu jadi
|}`,
    };
    expect(res).toStrictEqual(expected);
  });

  test("1 column (no English) (with a translator added in error)", () => {
    const lyrics: ILyricsRow[] = [
      { customStyle: "", original: "Bengawan Solo" },
      {
        customStyle: "",
        original: "Riwayatmu ini sedari dulu jadi",
      },
    ];
    const options = {
      headers: [],
      needsRomanization: false,
      needsTranslation: true,
      translator: "John Doe",
      bgColour: "black",
      fgColour: "white",
      createToggleElement: false,
    };
    const res = generateLyricsSegmentAsDataObject(lyrics, options);
    const expected = {
      lyrics: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|Bengawan Solo
|-
|Riwayatmu ini sedari dulu jadi
|}`,
    };
    expect(res).toStrictEqual(expected);
  });
});