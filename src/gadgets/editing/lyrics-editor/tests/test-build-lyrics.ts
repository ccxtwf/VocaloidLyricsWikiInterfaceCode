export const lyricsHeader = `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}`;

export const lyricsData1 = [
  ['', '色は匂えど', 'iro wa nioedo', 'lorem ipsum dolor sit amet'],
  ['', '散りぬるを', 'chirinuru o', 'consectetur adipiscing elit'],
  ['', '我が世誰ぞ', 'wa ga yo dare zo', 'sed do eiusmod tempor incididunt'],
  ['', '常ならん', 'tsune naran', 'ut labore et dolore magna aliqua'],
  ['', '有為の奥山', 'ui no okuyama', 'ut enim ad minim veniam'],
  ['', '今日越えて', 'kyou kaete', 'quis nostrud exercitation ullamco laboris'],
  ['', '浅き夢見じ', 'asaki yume miji', 'nisi ut aliquip ex ea commodo consequat'],
  ['', '酔いもせず', 'yoi mo sezu', 'duis aute irure dolor in reprehenderit']
];

export const expectedOutput1 = `{| {{lyrics table class}}
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
|}`;

export const lyricsData2 = [
  ['color:red;', '色は匂えど', 'iro wa nioedo', 'lorem ipsum dolor sit amet'],
  ['font-weight:bold;font-style:italic;', '散りぬるを', 'chirinuru o', 'consectetur adipiscing elit'],
  ['', 'wa ga yo dare zo', 'wa ga yo dare zo', 'wa ga yo dare zo'],
  ['', '', '', ''],
  ['', '-常ならん', '-tsune naran', '-ut labore et dolore magna aliqua'],
  ['color:red;', '有為の奥山', '有為の奥山', '有為の奥山'],
  ['', '<nowiki>-</nowiki>今日越えて', '<nowiki>-</nowiki>kyou kaete', '<nowiki>-</nowiki>quis nostrud exercitation ullamco laboris'],
  ['', '浅き夢見じ~~~~', 'asaki yume miji', 'nisi ut aliquip ex ea commodo consequat'],
  ['', '酔いもせず<nowiki>~~~~</nowiki>', 'yoi mo sezu', 'duis aute irure dolor in reprehenderit']
];

export const expectedOutput2 = `{| {{lyrics table class}}
|- class="lyrics-table-header"
! {{lyrics header}}
|-style="color:red;"
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet
|-style="font-weight:bold;font-style:italic;"
|散りぬるを
|chirinuru o
|consectetur adipiscing elit
|-
| {{shared}} wa ga yo dare zo
|-
|<br />
|-
|<nowiki>-</nowiki>常ならん
|<nowiki>-</nowiki>tsune naran
|<nowiki>-</nowiki>ut labore et dolore magna aliqua
|-style="color:red;"
| {{shared}} 有為の奥山
|-
|<nowiki>-</nowiki>今日越えて
|<nowiki>-</nowiki>kyou kaete
|<nowiki>-</nowiki>quis nostrud exercitation ullamco laboris
|-
|浅き夢見じ<nowiki>~~~~</nowiki>
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat
|-
|酔いもせず<nowiki>~~~~</nowiki>
|yoi mo sezu
|duis aute irure dolor in reprehenderit
|}`;
