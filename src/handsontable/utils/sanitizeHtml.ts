import modSanitizeHtml from "sanitize-html";

/**
 *
 * @param s
 * @returns
 */
export function sanitizeHtml(s: string) {
  return modSanitizeHtml(s, {
    allowedTags: [
      "b",
      "i",
      "u",
      "br",
      "span",
      "div",
      "p",
      "ul",
      "ol",
      "li",
      "detail",
      "summary",
      "s",
      "small",
      "sub",
      "sup",
      "strong",
      "em",
      "mark",
      "ruby",
      "rp",
      "rt",
      "code",
      "pre",
      "nowiki",
      "ref",
    ],
    allowedAttributes: {
      span: ["style", "class"],
      div: ["style", "class"],
      p: ["style", "class"],
      ref: ["name", "group", "class"],
    },
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