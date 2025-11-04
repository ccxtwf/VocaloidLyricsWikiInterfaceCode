export const table1 = `|-
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

export const expectedLyrics1 = [
  [
    ['', '色は匂えど', 'iro wa nioedo', 'lorem ipsum dolor sit amet'],
    ['', '散りぬるを', 'chirinuru o', 'consectetur adipiscing elit'],
    ['', '我が世誰ぞ', 'wa ga yo dare zo', 'sed do eiusmod tempor incididunt'],
    ['', '常ならん', 'tsune naran', 'ut labore et dolore magna aliqua'],
    ['', '有為の奥山', 'ui no okuyama', 'ut enim ad minim veniam'],
    ['', '今日越えて', 'kyou kaete', 'quis nostrud exercitation ullamco laboris'],
    ['', '浅き夢見じ', 'asaki yume miji', 'nisi ut aliquip ex ea commodo consequat'],
    ['', '酔いもせず', 'yoi mo sezu', 'duis aute irure dolor in reprehenderit']
  ],
  3
];

export const table2 = `|- style="color: red;"
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
| <br />
|-
| {{shared}} IROHA SONG 1
|-
| {{shared|3}} IROHA SONG 2
|-
| colspan="3" style="font-weight:bold;font-style:italic;" | IROHA SONG 3
|-
| style="font-weight:bold;font-style:italic;" colspan="3" | IROHA SONG 4
|-
| colspan="3" | IROHA SONG 5
|-
|<br />
|-
|<br>
|-
|<br/>
|-
| <br />
|
|
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

export const expectedLyrics2 = [
  [
    ['color: red;', '色は匂えど', 'iro wa nioedo', '{{wp|lorem ipsum dolor sit amet}}'],
    ['color:  green;', '散りぬるを', 'chirinuru o', 'consectetur adipiscing elit'],
    ['font-weight:bold;font-style:italic;', '我が世誰ぞ', 'wa ga yo dare zo', 'sed do eiusmod tempor [[link me|incididunt]]'],
    ['', '常ならん', 'tsune naran', 'ut labore et dolore magna aliqua'],
    ['', '有為の奥山', 'ui no okuyama', 'ut enim ad minim veniam'],
    ['', '', '', ''],
    ['', ' IROHA SONG 1', ' IROHA SONG 1', ' IROHA SONG 1'],
    ['', ' IROHA SONG 2', ' IROHA SONG 2', ' IROHA SONG 2'],
    ['', ' IROHA SONG 3', ' IROHA SONG 3', ' IROHA SONG 3'],
    ['', ' IROHA SONG 4', ' IROHA SONG 4', ' IROHA SONG 4'],
    ['', ' IROHA SONG 5', ' IROHA SONG 5', ' IROHA SONG 5'],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', ' <br />', '', ''],
    ['', '今日越えて', 'kyou kaete', 'quis nostrud exercitation ullamco laboris'],
    ['', '浅き夢見じ', 'asaki yume miji', 'nisi ut aliquip ex ea commodo consequat'],
    ['', '酔いもせず', 'yoi mo sezu', 'duis aute irure dolor in reprehenderit']
  ],
  3
];

export const table3 = `|-
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
|}`;

export const expectedLyrics3 = [
  [
    ['', '色は匂えど', 'iro wa nioedo'],
    ['', '散りぬるを', 'chirinuru o'],
    ['', '我が世誰ぞ', 'wa ga yo dare zo'],
    ['', '常ならん', 'tsune naran'],
    ['', '有為の奥山', 'ui no okuyama'],
    ['', '今日越えて', 'kyou kaete'],
    ['', '浅き夢見じ', 'asaki yume miji'],
    ['', '酔いもせず', 'yoi mo sezu']
  ],
  2
];

export const table4 = `|-
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
|}`;

export const expectedLyrics4 = [
  [
    ['', 'iro wa nioedo', 'lorem ipsum dolor sit amet'],
    ['', 'chirinuru o', 'consectetur adipiscing elit'],
    ['', 'wa ga yo dare zo', 'sed do eiusmod tempor incididunt'],
    ['', 'tsune naran', 'ut labore et dolore magna aliqua'],
    ['', 'ui no okuyama', 'ut enim ad minim veniam'],
    ['', 'kyou kaete', 'quis nostrud exercitation ullamco laboris'],
    ['', 'asaki yume miji', 'nisi ut aliquip ex ea commodo consequat'],
    ['', 'yoi mo sezu', 'duis aute irure dolor in reprehenderit']
  ],
  2
];

export const table5 = `|-
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
|}`;

export const expectedLyrics5 = [
  [
    ['', 'iro wa nioedo'],
    ['', 'chirinuru o'],
    ['', 'wa ga yo dare zo'],
    ['', 'tsune naran'],
    ['', 'ui no okuyama'],
    ['', 'kyou kaete'],
    ['', 'asaki yume miji'],
    ['', 'yoi mo sezu']
  ],
  1
];

export const table6 = `|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet1
|lorem ipsum dolor sit amet2
|lorem ipsum dolor sit amet3
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit1
|consectetur adipiscing elit2
|consectetur adipiscing elit3
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt1
|sed do eiusmod tempor incididunt2
|sed do eiusmod tempor incididunt3
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua1
|ut labore et dolore magna aliqua2
|ut labore et dolore magna aliqua3
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam1
|ut enim ad minim veniam2
|ut enim ad minim veniam3
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris1
|quis nostrud exercitation ullamco laboris2
|quis nostrud exercitation ullamco laboris3
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat1
|nisi ut aliquip ex ea commodo consequat2
|nisi ut aliquip ex ea commodo consequat3
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit1
|duis aute irure dolor in reprehenderit2
|duis aute irure dolor in reprehenderit3
|}`;

export const expectedLyrics6 = [
  [
    ['', '色は匂えど', 'iro wa nioedo', 'lorem ipsum dolor sit amet1', 'lorem ipsum dolor sit amet2', 'lorem ipsum dolor sit amet3'],
    ['', '散りぬるを', 'chirinuru o', 'consectetur adipiscing elit1', 'consectetur adipiscing elit2', 'consectetur adipiscing elit3'],
    ['', '我が世誰ぞ', 'wa ga yo dare zo', 'sed do eiusmod tempor incididunt1', 'sed do eiusmod tempor incididunt2', 'sed do eiusmod tempor incididunt3'],
    ['', '常ならん', 'tsune naran', 'ut labore et dolore magna aliqua1', 'ut labore et dolore magna aliqua2', 'ut labore et dolore magna aliqua3'],
    ['', '有為の奥山', 'ui no okuyama', 'ut enim ad minim veniam1', 'ut enim ad minim veniam2', 'ut enim ad minim veniam3'],
    ['', '今日越えて', 'kyou kaete', 'quis nostrud exercitation ullamco laboris1', 'quis nostrud exercitation ullamco laboris2', 'quis nostrud exercitation ullamco laboris3'],
    ['', '浅き夢見じ', 'asaki yume miji', 'nisi ut aliquip ex ea commodo consequat1', 'nisi ut aliquip ex ea commodo consequat2', 'nisi ut aliquip ex ea commodo consequat3'],
    ['', '酔いもせず', 'yoi mo sezu', 'duis aute irure dolor in reprehenderit1', 'duis aute irure dolor in reprehenderit2', 'duis aute irure dolor in reprehenderit3']
  ],
  5
];

export const table7 = `|-
|色は匂えど
|iro wa nioedo
|lorem ipsum dolor sit amet1
|lorem ipsum dolor sit amet2
|lorem ipsum dolor sit amet3
|lorem ipsum dolor sit amet4
|-
|散りぬるを
|chirinuru o
|consectetur adipiscing elit1
|consectetur adipiscing elit2
|consectetur adipiscing elit3
|consectetur adipiscing elit4
|-
|我が世誰ぞ
|wa ga yo dare zo
|sed do eiusmod tempor incididunt1
|sed do eiusmod tempor incididunt2
|sed do eiusmod tempor incididunt3
|sed do eiusmod tempor incididunt4
|-
|常ならん
|tsune naran
|ut labore et dolore magna aliqua1
|ut labore et dolore magna aliqua2
|ut labore et dolore magna aliqua3
|ut labore et dolore magna aliqua4
|-
|有為の奥山
|ui no okuyama
|ut enim ad minim veniam1
|ut enim ad minim veniam2
|ut enim ad minim veniam3
|ut enim ad minim veniam4
|-
|今日越えて
|kyou kaete
|quis nostrud exercitation ullamco laboris1
|quis nostrud exercitation ullamco laboris2
|quis nostrud exercitation ullamco laboris3
|quis nostrud exercitation ullamco laboris4
|-
|浅き夢見じ
|asaki yume miji
|nisi ut aliquip ex ea commodo consequat1
|nisi ut aliquip ex ea commodo consequat2
|nisi ut aliquip ex ea commodo consequat3
|nisi ut aliquip ex ea commodo consequat4
|-
|酔いもせず
|yoi mo sezu
|duis aute irure dolor in reprehenderit1
|duis aute irure dolor in reprehenderit2
|duis aute irure dolor in reprehenderit3
|duis aute irure dolor in reprehenderit4
|}`;

export const expectedLyrics7 = [
  [
    ['', '色は匂えど', 'iro wa nioedo', 'lorem ipsum dolor sit amet1', 'lorem ipsum dolor sit amet2', 'lorem ipsum dolor sit amet3'],
    ['', '散りぬるを', 'chirinuru o', 'consectetur adipiscing elit1', 'consectetur adipiscing elit2', 'consectetur adipiscing elit3'],
    ['', '我が世誰ぞ', 'wa ga yo dare zo', 'sed do eiusmod tempor incididunt1', 'sed do eiusmod tempor incididunt2', 'sed do eiusmod tempor incididunt3'],
    ['', '常ならん', 'tsune naran', 'ut labore et dolore magna aliqua1', 'ut labore et dolore magna aliqua2', 'ut labore et dolore magna aliqua3'],
    ['', '有為の奥山', 'ui no okuyama', 'ut enim ad minim veniam1', 'ut enim ad minim veniam2', 'ut enim ad minim veniam3'],
    ['', '今日越えて', 'kyou kaete', 'quis nostrud exercitation ullamco laboris1', 'quis nostrud exercitation ullamco laboris2', 'quis nostrud exercitation ullamco laboris3'],
    ['', '浅き夢見じ', 'asaki yume miji', 'nisi ut aliquip ex ea commodo consequat1', 'nisi ut aliquip ex ea commodo consequat2', 'nisi ut aliquip ex ea commodo consequat3'],
    ['', '酔いもせず', 'yoi mo sezu', 'duis aute irure dolor in reprehenderit1', 'duis aute irure dolor in reprehenderit2', 'duis aute irure dolor in reprehenderit3']
  ],
  5
];