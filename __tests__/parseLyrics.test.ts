import { describe, expect, test } from "vitest";
import {
  extractLyricsTablesFromWikipageSrc,
  parseLyrics,
} from "../src/lyricsEditor/utils/parseLyrics";

describe("parseLyrics", () => {
  test.each([
    {
      d: "Japanese song with fan-made translation",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
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
{{Translator|John Doe}}`,
      o: [
        {
          toggleText: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          lyrics: [
            ["", "あいうえお", "aiueo", "ABCDEFG"],
            ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
          ],
          translator: "John Doe",
          isOfficialTranslation: false,
        },
      ],
    },
    {
      d: "Japanese song with fan-made translation (unattributed)",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
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
|}`,
      o: [
        {
          toggleText: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          lyrics: [
            ["", "あいうえお", "aiueo", "ABCDEFG"],
            ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
          ],
          translator: "",
          isOfficialTranslation: false,
        },
      ],
    },
    {
      d: "Japanese song with shared column and a line break",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|-
|<br />
|-
| {{shared}} SHOUT!!!!
|-
| colspan="3" | SOME MORE!!!!
|}
{{Translator|John Doe}}`,
      o: [
        {
          toggleText: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          lyrics: [
            ["", "あいうえお", "aiueo", "ABCDEFG"],
            ["", "", "", ""],
            ["", "SHOUT!!!!", "SHOUT!!!!", "SHOUT!!!!"],
            ["", "SOME MORE!!!!", "SOME MORE!!!!", "SOME MORE!!!!"],
          ],
          translator: "John Doe",
          isOfficialTranslation: false,
        },
      ],
    },
    {
      d: "Japanese song with official translation by Anonymous",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
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
|}`,
      o: [
        {
          toggleText: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          lyrics: [
            ["", "あいうえお", "aiueo", "ABCDEFG"],
            ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
          ],
          translator: "",
          isOfficialTranslation: true,
        },
      ],
    },
    {
      d: "Japanese song with official translation",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
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
{{Translator|John Doe}}`,
      o: [
        {
          toggleText: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          lyrics: [
            ["", "あいうえお", "aiueo", "ABCDEFG"],
            ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
          ],
          translator: "John Doe",
          isOfficialTranslation: true,
        },
      ],
    },
    {
      d: "Japanese song with fan-made translation + license",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{TranslatorLicense|Foobar}}
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
{{Translator|Foobar}}`,
      o: [
        {
          toggleText: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          lyrics: [
            ["", "あいうえお", "aiueo", "ABCDEFG"],
            ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
          ],
          translator: "Foobar",
          isOfficialTranslation: false,
        },
      ],
    },
    {
      d: "Japanese song with fan-made translation + formatting",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|- style="color:red"
|あいうえお
|aiueo
|ABCDEFG
|- style="color: red;"  
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}`,
      o: [
        {
          toggleText: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          lyrics: [
            ["color:red;", "あいうえお", "aiueo", "ABCDEFG"],
            ["color: red;", "かきくけこ", "kakikukeko", "HIJKLMN"],
          ],
          translator: "John Doe",
          isOfficialTranslation: false,
        },
      ],
    },
    {
      d: "Japanese song without translation",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`,
      o: [
        {
          toggleText: "{{lyrics toggle|jp:Japanese|rom:Romaji}}",
          lyrics: [
            ["", "あいうえお", "aiueo"],
            ["", "かきくけこ", "kakikukeko"],
          ],
          translator: "",
          isOfficialTranslation: false,
        },
      ],
    },
    {
      d: "Japanese song with 5 columns",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English|eng2:English 2|eng3:English 3}}
{| {{lyrics table class}}
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
|}
{{Translator|John Doe}}
{{Translator|Jane Doe|anchor-col=eng2}}
{{Translator|Jack Doe|anchor-col=eng3}}`,
      o: [
        {
          toggleText:
            "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English|eng2:English 2|eng3:English 3}}",
          lyrics: [
            ["", "あいうえお", "aiueo", "ABCDEFG", "Eggs", "Bacon"],
            ["", "かきくけこ", "kakikukeko", "HIJKLMN", "Ham", "Cheese"],
          ],
          translator: "John Doe",
          isOfficialTranslation: false,
        },
      ],
    },
    {
      d: "Indonesian song with fan-made translation",
      i: `{{lyrics toggle|id:Indonesian|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|Bengawan Solo
|Solo River
|-
|Riwayatmu ini sedari dulu jadi
|As of now, your fate has
|}
{{Translator|John Doe}}`,
      o: [
        {
          toggleText: "{{lyrics toggle|id:Indonesian|eng:English}}",
          lyrics: [
            ["", "Bengawan Solo", "Solo River"],
            ["", "Riwayatmu ini sedari dulu jadi", "As of now, your fate has"],
          ],
          translator: "John Doe",
          isOfficialTranslation: false,
        },
      ],
    },
    {
      d: "Indonesian song without translation",
      i: `{{lyrics toggle|id:Indonesian}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|Bengawan Solo
|-
|Riwayatmu ini sedari dulu jadi
|}`,
      o: [
        {
          toggleText: "{{lyrics toggle|id:Indonesian}}",
          lyrics: [
            ["", "Bengawan Solo"],
            ["", "Riwayatmu ini sedari dulu jadi"],
          ],
          translator: "",
          isOfficialTranslation: false,
        },
      ],
    },
    {
      d: "Page with multiple lyrics tables",
      i: `<tabber>
|-| Original =
{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
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
{{Translator|John Doe}}
|-| Chinese version =
{{lyrics toggle|cn:Chinese|py:Pinyin|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|啊伊乌呃哦
|a yi wu e o
|OPQRSTU
|-
|啦利鲁乐咯
|la li lu le lo
|VWXYZ
|}
{{Translator|Jack Doe}}
</tabber>`,
      o: [
        {
          toggleText: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          lyrics: [
            ["", "あいうえお", "aiueo", "ABCDEFG"],
            ["", "かきくけこ", "kakikukeko", "HIJKLMN"],
          ],
          translator: "John Doe",
          isOfficialTranslation: false,
        },
        {
          toggleText: "{{lyrics toggle|cn:Chinese|py:Pinyin|eng:English}}",
          lyrics: [
            ["", "啊伊乌呃哦", "a yi wu e o", "OPQRSTU"],
            ["", "啦利鲁乐咯", "la li lu le lo", "VWXYZ"],
          ],
          translator: "Jack Doe",
          isOfficialTranslation: false,
        },
      ],
    },
    {
      d: "Edge case - Too many columns",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG
|Should not show
|-
|<br />
|Should show
|-
| colspan="2" | ABCD
|Should show
|Should not show
|-
| {{shared}} EFGH
|Should not show
|-
|IJKL
| {{shared|2}} MNOPQ
|Should not show
|}
{{Translator|John Doe}}`,
      o: [
        {
          toggleText: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          lyrics: [
            ["", "あいうえお", "aiueo", "ABCDEFG"],
            ["", "<br />", "Should show"],
            ["", "ABCD", "ABCD", "Should show"],
            ["", "EFGH", "EFGH", "EFGH"],
            ["", "IJKL", "MNOPQ", "MNOPQ"],
          ],
          translator: "John Doe",
          isOfficialTranslation: false,
        },
      ],
    },
  ])("$d", ({ i, o }) => {
    const rxResults = extractLyricsTablesFromWikipageSrc(i);
    expect(rxResults.length).toBe(o.length);
    const gotParsedResults = rxResults.map(parseLyrics);
    expect(gotParsedResults).toStrictEqual(o);
  });
});