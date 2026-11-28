import { describe, expect, test } from "vitest";
import { extractLyricsTablesFromWikipageSrc } from "../src/lyricsEditor/utils/parseLyrics";

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
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
          translator: "John Doe",
          append: "",
        },
      ],
    },
    {
      d: "Japanese song with fan-made translation and translation notes",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}

==Translation Notes==
{{Reflist}}
`,
      o: [
        {
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`,
          translatorTemplate: "{{Translator|John Doe}}",
          translator: "John Doe",
          append: "\n\n==Translation Notes==\n",
        },
      ],
    },
    {
      d: "Japanese song with fan-made translation and translation notes",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}

== Translation Notes ==
{{Reflist}}
`,
      o: [
        {
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`,
          translatorTemplate: "{{Translator|John Doe}}",
          translator: "John Doe",
          append: "\n\n== Translation Notes ==\n",
        },
      ],
    },
    {
      d: "Japanese song with fan-made translation and translation notes",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}

==Notes==
<references />
`,
      o: [
        {
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`,
          translatorTemplate: "{{Translator|John Doe}}",
          translator: "John Doe",
          append: "\n\n==Notes==\n",
        },
      ],
    },
    {
      d: "Japanese song with fan-made translation and translation notes",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}

==Notes==
<references group="abc" />
`,
      o: [
        {
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`,
          translatorTemplate: "{{Translator|John Doe}}",
          translator: "John Doe",
          append: "\n\n==Notes==\n",
        },
      ],
    },
    {
      d: "Japanese song with fan-made translation and translation notes",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}
{{Translator|Jane Doe|lang=English}}

==Notes==
<references />
`,
      o: [
        {
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`,
          translatorTemplate: "{{Translator|John Doe}}",
          translator: "John Doe",
          append: "\n{{Translator|Jane Doe|lang=English}}\n\n==Notes==\n",
        },
      ],
    },
    {
      d: "Japanese song with fan-made translation and translation notes",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe|Jane Doe|Jack Doe}}

==Notes==
<references />
`,
      o: [
        {
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`,
          translatorTemplate: "{{Translator|John Doe|Jane Doe|Jack Doe}}",
          translator: "John Doe|Jane Doe|Jack Doe",
          append: "\n\n==Notes==\n",
        },
      ],
    },
    {
      d: "Japanese song with fan-made translation and translation notes",
      i: `{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}
{{Translator|John Doe}}

== Notes ==
<references />
`,
      o: [
        {
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|ABCDEFG<ref>lorem ipsum</ref>
|-
|かきくけこ
|kakikukeko
|HIJKLMN
|}`,
          translatorTemplate: "{{Translator|John Doe}}",
          translator: "John Doe",
          append: "\n\n== Notes ==\n",
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
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
          translatorTemplate: "",
          append: "",
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
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
|}`,
          translatorTemplate: "{{Translator|John Doe}}",
          translator: "John Doe",
          append: "",
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
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n{{OfficialEnglishNotify}}\n",
          lyricsTable: `{| {{lyrics table class}}
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
          translatorTemplate: "",
          append: "",
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
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n{{OfficialEnglishNotify}}\n",
          lyricsTable: `{| {{lyrics table class}}
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
          translator: "John Doe",
          append: "",
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
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n{{TranslatorLicense|Foobar}}\n",
          lyricsTable: `{| {{lyrics table class}}
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
          translatorTemplate: "{{Translator|Foobar}}",
          translator: "Foobar",
          append: "",
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
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
|}`,
          translatorTemplate: "{{Translator|John Doe}}",
          translator: "John Doe",
          append: "",
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
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|あいうえお
|aiueo
|-
|かきくけこ
|kakikukeko
|}`,
          translatorTemplate: "",
          append: "",
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
          toggle:
            "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English|eng2:English 2|eng3:English 3}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
          translator: "John Doe",
          append: "",
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
          toggle: "{{lyrics toggle|id:Indonesian|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
          translator: "John Doe",
          append: "",
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
          toggle: "{{lyrics toggle|id:Indonesian}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|Bengawan Solo
|-
|Riwayatmu ini sedari dulu jadi
|}`,
          translatorTemplate: "",
          append: "",
        },
      ],
    },
    {
      d: "Page with multiple lyrics tables 1",
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
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
          translator: "John Doe",
          append: "\n|-|",
        },
        {
          toggle: "{{lyrics toggle|cn:Chinese|py:Pinyin|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
|}`,
          translatorTemplate: "{{Translator|Jack Doe}}",
          translator: "Jack Doe",
          append: "\n</tabber>",
        },
      ],
    },
    {
      d: "Page with multiple lyrics tables 2",
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

==Translation Notes==
{{Reflist}}
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

==Translation Notes==
{{Reflist}}
</tabber>`,
      o: [
        {
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
          translator: "John Doe",
          append: "\n\n==Translation Notes==\n{{Reflist}}\n|-|",
        },
        {
          toggle: "{{lyrics toggle|cn:Chinese|py:Pinyin|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
|}`,
          translatorTemplate: "{{Translator|Jack Doe}}",
          translator: "Jack Doe",
          append: "\n\n==Translation Notes==\n{{Reflist}}\n</tabber>",
        },
      ],
    },
    {
      d: "Page with multiple lyrics tables 3",
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

==Translation Notes==
{{Reflist}}
</tabber>`,
      o: [
        {
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
          translator: "John Doe",
          append: "\n|-|",
        },
        {
          toggle: "{{lyrics toggle|cn:Chinese|py:Pinyin|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
|}`,
          translatorTemplate: "{{Translator|Jack Doe}}",
          translator: "Jack Doe",
          append: "\n\n==Translation Notes==\n{{Reflist}}\n</tabber>",
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
          toggle: "{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}",
          moreNotifs: "\n",
          lyricsTable: `{| {{lyrics table class}}
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
|}`,
          translatorTemplate: "{{Translator|John Doe}}",
          translator: "John Doe",
          append: "",
        },
      ],
    },
  ])("$d", ({ i, o }) => {
    const rxResults = extractLyricsTablesFromWikipageSrc(i);
    expect(rxResults.length).toBe(o.length);
    const gotParsedResults = rxResults.map((res) => res.groups!);
    expect(gotParsedResults).toMatchObject(o);
  });
});