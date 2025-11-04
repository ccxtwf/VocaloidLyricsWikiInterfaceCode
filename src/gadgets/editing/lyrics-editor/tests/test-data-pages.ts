export const sampleWikitext1 = `{{Epilepsy}}
{{Infobox Song
|songtitle = "'''ORIGINAL TITLE'''"
|color = #6c091b; color:#e93c44
|original upload date = {{Date|2025|July|25}}
|singer = [[Hatsune Miku (VOCALOID)]]
|producer = [[some producer]] (music, lyrics)
|#views = 1 bajillion
|link = {{#|https://www.nicovideo.jp/watch/sm********}} {{#|https://www.youtube.com/watch?v=**********}}
|description = "Hey I'm walking here."
|language = Japanese
}}

==Lyrics==
{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{TranslatorLicense2|some translator}}
{| {{Lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}
{{Translator|some translator}}

==External Links==
*[some link]

[[Category:Some categories]]`;

export const expectedParsedTables1 = [[`{| {{Lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}`, `{| {{Lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}`, `|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}`]];

export const sampleWikitext2 = `{{Epilepsy}}
{{Infobox Song
|songtitle = "'''ORIGINAL TITLE'''"
|color = #6c091b; color:#e93c44
|original upload date = {{Date|2025|July|25}}
|singer = [[Hatsune Miku (VOCALOID)]]
|producer = [[some producer]] (music, lyrics)
|#views = 1 bajillion
|link = {{#|https://www.nicovideo.jp/watch/sm********}} {{#|https://www.youtube.com/watch?v=**********}}
|description = "Hey I'm walking here."
|language = Japanese
}}

==Lyrics==
{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{TranslatorLicense2|some translator}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|- style="color: red;"
|色は匂えど
|iro wa nioedo
|{{wp|lorem ipsum dolor sit amet}}
|- span style="color:  green"
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|- style='font-weight:bold;font-style:italic'
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor [[link me|incididunt]]
|- unexpected style
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|-
| {{shared}} IROHA SONG
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}
{{Translator|some translator}}

==External Links==
*[some link]

[[Category:Some categories]]`;

export const expectedParsedTables2 = [[`{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|- style="color: red;"
|色は匂えど
|iro wa nioedo
|{{wp|lorem ipsum dolor sit amet}}
|- span style="color:  green"
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|- style='font-weight:bold;font-style:italic'
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor [[link me|incididunt]]
|- unexpected style
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|-
| {{shared}} IROHA SONG
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}`, `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}`, `|- style="color: red;"
|色は匂えど
|iro wa nioedo
|{{wp|lorem ipsum dolor sit amet}}
|- span style="color:  green"
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|- style='font-weight:bold;font-style:italic'
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor [[link me|incididunt]]
|- unexpected style
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|-
| {{shared}} IROHA SONG
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}`]];

export const sampleWikitext3 = `{{Epilepsy}}
{{Infobox Song
|songtitle = "'''ORIGINAL TITLE'''"
|color = #6c091b; color:#e93c44
|original upload date = {{Date|2025|July|25}}
|singer = [[Hatsune Miku (VOCALOID)]]
|producer = [[some producer]] (music, lyrics)
|#views = 1 bajillion
|link = {{#|https://www.nicovideo.jp/watch/sm********}} {{#|https://www.youtube.com/watch?v=**********}}
|description = "Hey I'm walking here."
|language = Japanese
}}

==Lyrics==
<tabber>
Version 1 =
{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{TranslatorLicense2|some translator}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}
{{Translator|some translator}}
|-| 
Version 2 =
{{lyrics toggle|jp:Japanese|rom:Romaji}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|色は匂えど
|iro wa nioedo
|-
|散りぬるを
|chirinuru o
|-
|我が世誰ぞ
|wa ga yo dare zo
|-
|常ならん
|tsune naran
|-
|有為の奥山
|ui no okuyama
|-
|今日越えて
|kyou kaete
|-
|浅き夢見じ
|asaki yume miji
|-
|酔いもせず
|yoi mo sezu
|}
</tabber>

==External Links==
*[some link]

[[Category:Some categories]]`;

export const expectedParsedTables3 = [
[`{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}`, `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}`, `|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}`],
[`{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|色は匂えど
|iro wa nioedo
|-
|散りぬるを
|chirinuru o
|-
|我が世誰ぞ
|wa ga yo dare zo
|-
|常ならん
|tsune naran
|-
|有為の奥山
|ui no okuyama
|-
|今日越えて
|kyou kaete
|-
|浅き夢見じ
|asaki yume miji
|-
|酔いもせず
|yoi mo sezu
|}`, `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}`, `|-
|色は匂えど
|iro wa nioedo
|-
|散りぬるを
|chirinuru o
|-
|我が世誰ぞ
|wa ga yo dare zo
|-
|常ならん
|tsune naran
|-
|有為の奥山
|ui no okuyama
|-
|今日越えて
|kyou kaete
|-
|浅き夢見じ
|asaki yume miji
|-
|酔いもせず
|yoi mo sezu
|}`]
]

export const sampleWikitext4 = `{{Epilepsy}}
{{Infobox Song
|songtitle = "'''ORIGINAL TITLE'''"
|color = #6c091b; color:#e93c44
|original upload date = {{Date|2025|July|25}}
|singer = [[Hatsune Miku (VOCALOID)]]
|producer = [[some producer]] (music, lyrics)
|#views = 1 bajillion
|link = {{#|https://www.nicovideo.jp/watch/sm********}} {{#|https://www.youtube.com/watch?v=**********}}
|description = "Hey I'm walking here."
|language = Japanese
}}

==Lyrics==
{{lyrics toggle|sp:Spanish|eng:English}}
{{TranslatorLicense2|some translator}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|iro wa nioedo
|lorem ipsum dolor sit amet
|-
|chirinuru o
|consectetur adipiscing elit
|-
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|-
|tsune naran
|ut labore et dolore magna aliqua
|-
|ui no okuyama
|ut enim ad minim veniam
|-
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}
{{Translator|some translator}}

==External Links==
*[some link]

[[Category:Some categories]]`;

export const expectedParsedTables4 = [[`{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|iro wa nioedo
|lorem ipsum dolor sit amet
|-
|chirinuru o
|consectetur adipiscing elit
|-
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|-
|tsune naran
|ut labore et dolore magna aliqua
|-
|ui no okuyama
|ut enim ad minim veniam
|-
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}`, `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}`, `|-
|iro wa nioedo
|lorem ipsum dolor sit amet
|-
|chirinuru o
|consectetur adipiscing elit
|-
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|-
|tsune naran
|ut labore et dolore magna aliqua
|-
|ui no okuyama
|ut enim ad minim veniam
|-
|kyou kaete
|quis nostrud exercitation ullamco laboris
|-
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}`]];

export const sampleWikitext5 = `{{Epilepsy}}
{{Infobox Song
|songtitle = "'''ORIGINAL TITLE'''"
|color = #6c091b; color:#e93c44
|original upload date = {{Date|2025|July|25}}
|singer = [[Hatsune Miku (VOCALOID)]]
|producer = [[some producer]] (music, lyrics)
|#views = 1 bajillion
|link = {{#|https://www.nicovideo.jp/watch/sm********}} {{#|https://www.youtube.com/watch?v=**********}}
|description = "Hey I'm walking here."
|language = Japanese
}}

==Lyrics==
{{lyrics toggle|sp:Spanish}}
{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|iro wa nioedo
|-
|chirinuru o
|-
|wa ga yo dare zo
|-
|tsune naran
|-
|ui no okuyama
|-
|kyou kaete
|-
|asaki yume miji
|-
|yoi mo sezu
|}

==External Links==
*[some link]

[[Category:Some categories]]`;

export const expectedParsedTables5 = [[`{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|iro wa nioedo
|-
|chirinuru o
|-
|wa ga yo dare zo
|-
|tsune naran
|-
|ui no okuyama
|-
|kyou kaete
|-
|asaki yume miji
|-
|yoi mo sezu
|}`, `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}`, `|-
|iro wa nioedo
|-
|chirinuru o
|-
|wa ga yo dare zo
|-
|tsune naran
|-
|ui no okuyama
|-
|kyou kaete
|-
|asaki yume miji
|-
|yoi mo sezu
|}`]];

export const sampleWikitext6 = `{{Epilepsy}}
{{Infobox Song
|songtitle = "'''ORIGINAL TITLE'''"
|color = #6c091b; color:#e93c44
|original upload date = {{Date|2025|July|25}}
|singer = [[Hatsune Miku (VOCALOID)]]
|producer = [[some producer]] (music, lyrics)
|#views = 1 bajillion
|link = {{#|https://www.nicovideo.jp/watch/sm********}} {{#|https://www.youtube.com/watch?v=**********}}
|description = "Hey I'm walking here."
|language = Japanese
}}

==Lyrics==
{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{TranslatorLicense2|some translator}}
{| {{Lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|consectetur adipiscing elit
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|ut enim ad minim veniam
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|}
{{Translator|some translator}}

==External Links==
*[some link]

[[Category:Some categories]]`;

export const expectedParsedTables6 = [[`{| {{Lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|consectetur adipiscing elit
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|ut enim ad minim veniam
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|}`, `{| {{Lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}`, `|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|consectetur adipiscing elit
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|ut enim ad minim veniam
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|}`]];

export const sampleWikitext7 = `{{Epilepsy}}
{{Infobox Song
|songtitle = "'''ORIGINAL TITLE'''"
|color = #6c091b; color:#e93c44
|original upload date = {{Date|2025|July|25}}
|singer = [[Hatsune Miku (VOCALOID)]]
|producer = [[some producer]] (music, lyrics)
|#views = 1 bajillion
|link = {{#|https://www.nicovideo.jp/watch/sm********}} {{#|https://www.youtube.com/watch?v=**********}}
|description = "Hey I'm walking here."
|language = Japanese
}}

==Lyrics==
{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}
{{TranslatorLicense2|some translator}}
{| {{Lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|consectetur adipiscing elit
|consectetur adipiscing elit
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|ut enim ad minim veniam
|ut enim ad minim veniam
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|}
{{Translator|some translator}}

==External Links==
*[some link]

[[Category:Some categories]]`;

export const expectedParsedTables7 = [[`{| {{Lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|consectetur adipiscing elit
|consectetur adipiscing elit
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|ut enim ad minim veniam
|ut enim ad minim veniam
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|}`, `{| {{Lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}`, `|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|lorem ipsum dolor sit amet
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|consectetur adipiscing elit
|consectetur adipiscing elit
|consectetur adipiscing elit
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|sed do eiusmod tempor incididunt
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|ut labore et dolore magna aliqua
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam
|ut enim ad minim veniam
|ut enim ad minim veniam
|ut enim ad minim veniam
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|duis aute irure dolor in reprehenderit
|}`]]