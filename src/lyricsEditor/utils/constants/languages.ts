interface ILanguage {
  name: string;
  transliteration?: string;
  iso?: string;
  isChinese?: boolean;
}

const LANGUAGES: ILanguage[] = [
  {
    name: "English",
    iso: "en",
  },
  {
    name: "Japanese",
    transliteration: "Romaji",
    iso: "ja",
  },
  {
    name: "Mandarin",
    transliteration: "Pinyin",
    iso: "zh-Hans",
    isChinese: true,
  },
  {
    name: "Korean",
    transliteration: "Romaja",
    iso: "ko",
  },
  {
    name: "Spanish",
    iso: "es",
  },
  {
    name: "Acehnese",
    iso: "id",
  },
  {
    name: "Ainu",
    iso: "ain",
  },
  {
    name: "Arabic",
    transliteration: "Romanization",
    iso: "ara",
  },
  {
    name: "Basque",
    iso: "eus",
  },
  {
    name: "Belarusian",
    transliteration: "Romanization",
    iso: "bel",
  },
  {
    name: "Bulgarian",
    transliteration: "Romanization",
    iso: "bul",
  },
  {
    name: "Cantonese",
    transliteration: "Jyutping",
    iso: "zh-Hant",
    isChinese: true,
  },
  {
    name: "Catalan",
    iso: "ca",
  },
  {
    name: "Cherokee",
    transliteration: "Romanization",
    iso: "chr",
  },
  {
    name: "Croatian",
    iso: "hrv",
  },
  {
    name: "Czech",
    iso: "ces",
  },
  {
    name: "Danish",
    iso: "dan",
  },
  {
    name: "Dutch",
    iso: "nl",
  },
  {
    name: "Esperanto",
    iso: "eo",
  },
  {
    name: "Estonian",
    iso: "est",
  },
  {
    name: "Evenki",
    transliteration: "Romanization",
    iso: "evn",
  },
  {
    name: "Filipino",
    iso: "tl",
  },
  {
    name: "Finnish",
    iso: "fi",
  },
  {
    name: "French",
    iso: "fr",
  },
  {
    name: "Gaelic",
    iso: "gle",
  },
  {
    name: "German",
    iso: "de",
  },
  {
    name: "Greek",
    transliteration: "Romanization",
    iso: "el",
  },
  {
    name: "Hindi",
    transliteration: "Romanization",
    iso: "hin",
  },
  {
    name: "Hungarian",
    iso: "hun",
  },
  {
    name: "Indonesian",
    iso: "id",
  },
  {
    name: "Irish",
    iso: "ga",
  },
  {
    name: "Italian",
    iso: "it",
  },
  {
    name: "Latin",
    iso: "la",
  },
  {
    name: "Malay",
    iso: "ms",
  },
  {
    name: "Mongolian",
    transliteration: "Romanization",
    iso: "mon",
  },
  {
    name: "Northern Wu",
    transliteration: "Romanization",
    iso: "taiu",
    isChinese: true,
  },
  {
    name: "Norwegian",
    iso: "nor",
  },
  {
    name: "Old-Middle Chinese",
    iso: "zh-Hans",
    isChinese: true,
  },
  {
    name: "Polish",
    iso: "pl",
  },
  {
    name: "Portuguese",
    iso: "pt",
  },
  {
    name: "Quanzhou Min",
    iso: "zh-Hant",
    isChinese: true,
  },
  {
    name: "Romanian",
    iso: "ro",
  },
  {
    name: "Russian",
    transliteration: "Romanization",
    iso: "ru",
  },
  {
    name: "Serbian",
    iso: "srp",
  },
  {
    name: "Slovak",
    iso: "slk",
  },
  {
    name: "Somali",
    iso: "som",
  },
  {
    name: "Southern Quechua",
    iso: "qwc",
  },
  {
    name: "Sundanese",
    iso: "su",
  },
  {
    name: "Swedish",
    iso: "sv",
  },
  {
    name: "Taiwanese",
    transliteration: "Tâi-lô",
    iso: "zh-Hant",
    isChinese: true,
  },
  {
    name: "Tajik",
    transliteration: "Romanization",
    iso: "tgk",
  },
  {
    name: "Thai",
    transliteration: "Romanization",
  },
  {
    name: "Toki Pona",
    iso: "tok",
  },
  {
    name: "Turkish",
    iso: "tr",
  },
  {
    name: "Ukrainian",
    transliteration: "Romanization",
    iso: "uk",
  },
  {
    name: "Urdu",
    transliteration: "Romanization",
    iso: "ur",
  },
  {
    name: "Vietnamese",
    iso: "vi",
  },
  {
    name: "Welsh",
    iso: "cy",
  },
  {
    name: "Yakut",
    transliteration: "Romanization",
    iso: "sah",
  },
  {
    name: "Yiddish",
    transliteration: "Romanization",
    iso: "yid",
  },
  {
    name: "Conlang",
  },
  {
    name: "Nonlexical",
  },
] as const;

export default LANGUAGES;