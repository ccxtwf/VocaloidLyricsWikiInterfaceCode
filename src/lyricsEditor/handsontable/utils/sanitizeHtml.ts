import modSanitizeHtml from "sanitize-html";

/**
 * Refer to the following page for the list of allowed HTML tags in MediaWiki:
 * https://www.mediawiki.org/wiki/Help:HTML_in_wikitext
 *
 * Notes: Also disallow <table>, <tr>, <th>, <td>, <caption>, <link>, <meta>
 */
const allowedTags = [
  "b",
  "i",
  "u",
  "br",
  "hr",
  "span",
  "div",
  "p",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "code",
  "kbd",
  "samp",
  "blockquote",
  "abbr",
  "cite",
  "data",
  "del",
  "ins",
  "s",
  "small",
  "big",
  "sub",
  "sup",
  "strong",
  "em",
  "mark",
  "bdi",
  "bdo",
  "dd",
  "dl",
  "dt",
  "dfn",
  "q",
  "time",
  "var",
  "wbr",
  "ruby",
  "rp",
  "rt",
  "code",
  "pre",
  "nowiki",
  "ref",
];

const allowedAttributes = {
  "*": ["style", "class"],
  ref: ["name", "group", "class"],
};

const allowedClasses = {
  "*": [/^[a-zA-Z0-9 \-_]+$/],
};

const allowedStyles = (() => {
  /**
   * These helpers are written with the assistance of ChatGPT under the following prompts:
   *  - I am implementing a rich text formatter. What CSS properties should I whitelist?
   *  - i am using the npm library sanitize-html. Write me a starting config that incorporates `allowedStyles` using this whitelist.
   */
  const rxColours = [
    /^#[\da-f]{3,8}$/i,
    /^(?:rgb|rgba|hsl|hsla)\([\d.%\s,/-]+\)$/i,
    /^[a-z]{3,20}$/i,
  ];
  const rxLengths = [/^(?:0|-?\d+(?:\.\d+)?(?:px|em|rem|%|pt|pc|ch|ex|vh|vw))$/i];
  const rxPositiveLengths = [/^(?:0|\d+(?:\.\d+)?(?:px|em|rem|%|pt|pc|ch|ex|vh|vw))$/i];
  const rxLengthList = [
    /^(?:0|-?\d+(?:\.\d+)?(?:px|em|rem|%|pt|pc|ch|ex|vh|vw))(?:\s+(?:0|-?\d+(?:\.\d+)?(?:px|em|rem|%|pt|pc|ch|ex|vh|vw))){0,3}$/i,
  ];
  const compileRxFromEnum = (...values: string[]) => [new RegExp(`^(?:${values.join("|")})$`, "i")];
  return {
    "*": {
      // Typography
      color: rxColours,
      "background-color": rxColours,
      "font-family": [/^[\w\s"',-]{1,100}$/],
      "font-size": [
        ...rxPositiveLengths,
        ...compileRxFromEnum("small", "medium", "large", "x-small", "x-large"),
      ],
      "font-weight": [...compileRxFromEnum("normal", "bold", "bolder", "lighter"), /^\d{3}$/],
      "font-style": compileRxFromEnum("normal", "italic", "oblique"),
      "text-align": compileRxFromEnum("left", "right", "center", "justify", "start", "end"),
      "text-decoration": compileRxFromEnum("none", "underline", "overline", "line-through"),
      "text-decoration-line": compileRxFromEnum("none", "underline", "overline", "line-through"),
      "text-decoration-color": rxColours,
      "text-decoration-style": compileRxFromEnum("solid", "double", "dotted", "dashed", "wavy"),
      "text-transform": compileRxFromEnum("none", "capitalize", "uppercase", "lowercase"),
      "text-indent": rxLengths,
      "letter-spacing": [...rxLengths, ...compileRxFromEnum("normal")],
      "word-spacing": [...rxLengths, ...compileRxFromEnum("normal")],
      "line-height": [...rxPositiveLengths, /^\d+(?:\.\d+)?$/, ...compileRxFromEnum("normal")],
      "white-space": compileRxFromEnum("normal", "nowrap", "pre", "pre-wrap", "pre-line"),
      "word-break": compileRxFromEnum("normal", "break-all", "keep-all", "break-word"),
      "overflow-wrap": compileRxFromEnum("normal", "break-word", "anywhere"),
      direction: compileRxFromEnum("ltr", "rtl"),
      "vertical-align": [
        ...rxLengths,
        ...compileRxFromEnum("baseline", "sub", "super", "top", "middle", "bottom"),
      ],

      // Layout
      display: compileRxFromEnum(
        "inline",
        "block",
        "inline-block",
        "table",
        "table-cell",
        "table-row",
      ),

      // Spacing
      margin: rxLengthList,
      "margin-top": rxLengths,
      "margin-right": rxLengths,
      "margin-bottom": rxLengths,
      "margin-left": rxLengths,

      padding: rxLengthList,
      "padding-top": rxPositiveLengths,
      "padding-right": rxPositiveLengths,
      "padding-bottom": rxPositiveLengths,
      "padding-left": rxPositiveLengths,

      // Dimensions
      width: [...rxPositiveLengths, ...compileRxFromEnum("auto")],
      height: [...rxPositiveLengths, ...compileRxFromEnum("auto")],
      "max-width": [...rxPositiveLengths, ...compileRxFromEnum("none")],
      "min-width": rxPositiveLengths,
      "max-height": [...rxPositiveLengths, ...compileRxFromEnum("none")],
      "min-height": rxPositiveLengths,

      // Borders
      border: [
        /^(?:none|(?:\d+(?:\.\d+)?(?:px|em|rem|pt)\s+)?(?:solid|dashed|dotted|double)\s+(?:#[\da-f]{3,8}|[a-z]+))$/i,
      ],
      "border-top": [
        /^(?:none|(?:\d+(?:\.\d+)?(?:px|em|rem|pt)\s+)?(?:solid|dashed|dotted|double)\s+(?:#[\da-f]{3,8}|[a-z]+))$/i,
      ],
      "border-right": [
        /^(?:none|(?:\d+(?:\.\d+)?(?:px|em|rem|pt)\s+)?(?:solid|dashed|dotted|double)\s+(?:#[\da-f]{3,8}|[a-z]+))$/i,
      ],
      "border-bottom": [
        /^(?:none|(?:\d+(?:\.\d+)?(?:px|em|rem|pt)\s+)?(?:solid|dashed|dotted|double)\s+(?:#[\da-f]{3,8}|[a-z]+))$/i,
      ],
      "border-left": [
        /^(?:none|(?:\d+(?:\.\d+)?(?:px|em|rem|pt)\s+)?(?:solid|dashed|dotted|double)\s+(?:#[\da-f]{3,8}|[a-z]+))$/i,
      ],
      "border-width": rxLengthList,
      "border-style": compileRxFromEnum("none", "solid", "dashed", "dotted", "double"),
      "border-color": rxColours,
      "border-radius": rxLengthList,

      // Lists
      "list-style-type": compileRxFromEnum(
        "none",
        "disc",
        "circle",
        "square",
        "decimal",
        "lower-alpha",
        "upper-alpha",
        "lower-roman",
        "upper-roman",
      ),
      "list-style-position": compileRxFromEnum("inside", "outside"),

      // Tables
      "border-collapse": compileRxFromEnum("collapse", "separate"),
      "border-spacing": rxLengthList,
      "table-layout": compileRxFromEnum("auto", "fixed"),
      "caption-side": compileRxFromEnum("top", "bottom"),
    },
  };
})();

/**
 *
 * @param s
 * @returns
 */
export function sanitizeHtml(s: string) {
  return modSanitizeHtml(s, {
    allowedTags,
    allowedAttributes,
    allowedClasses,
    allowedStyles,
    selfClosing: ["br", "nowiki", "ref"],
    disallowedTagsMode: "escape",
    allowedSchemes: false,
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [],
    allowVulnerableTags: false,
    transformTags: {
      nowiki: "span",
      ref: () => ({
        tagName: "span",
        attribs: {
          class: "ref",
        },
      }),
    },
  });
}