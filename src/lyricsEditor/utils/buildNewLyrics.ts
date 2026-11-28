import {
  determineColumnHeaders,
  generateLyricsSegmentAsDataObject,
  mapHandsontableLyricsData,
  truncateLyrics,
} from "./lyricsUtils";

const rxSingersTemplate = /{\|[^\n]*\n! *style *= *"[a-zA-Z0-9:;\.,\- ]+" *\| *Singer(?:.*?)\n\|}/s;
const rxOfficialEnglishTemplate = /\{\{(?:[Tt]emplate:|)[Oo]fficialEnglishNotify[^}]*\}\}/;
const rxTranslationNotes = /={2,} *(?:translation +|)notes *={2,}\n/i;

export function buildNewLyricsSegment(
  oldParts: RegExpMatchArray,
  lyricsData: unknown[][],
  {
    toggleText,
    translator,
    isOfficialTranslation,
  }: { toggleText: string; translator: string; isOfficialTranslation: boolean },
) {
  const [d, needsRomanization] = mapHandsontableLyricsData(
    determineColumnHeaders(toggleText),
    lyricsData,
  );
  let { moreNotifs = "", append = "", translatorTemplate = "" } = oldParts.groups!;
  const {
    lyrics,
    singers,
    officialEngTemplate,
    translatorLicenseTemplate,
    translatorTemplate: newTranslatorTemplate,
    translationNotes,
  } = generateLyricsSegmentAsDataObject(truncateLyrics(d), {
    needsRomanization,
    needsTranslation: true,
    showEnglishColumn: false,
    translator,
    isOfficialTranslation,
    createToggleElement: false,
  });
  /**
   * Actions:
   *  - Replace singers in moreNotifs if the template is found
   *  - Add singers to moreNotifs if the template is not found
   *  - Replace officialEnglishTemplate in moreNotifs if the template is found
   *  - Add officialEnglishTemplate to moreNotifs if the template is not found
   *  - Only add translatorLicenseTemplate to moreNotifs if not already added
   */
  if (officialEngTemplate && !rxOfficialEnglishTemplate.test(moreNotifs)) {
    // prepend to start of moreNotifs
    moreNotifs = "\n" + officialEngTemplate + "\n" + moreNotifs.trimStart();
  } else {
    // this also replaces the existing singers template with an empty string
    moreNotifs = moreNotifs.replace(rxOfficialEnglishTemplate, officialEngTemplate || "");
  }
  if (singers && !rxSingersTemplate.test(moreNotifs)) {
    // prepend to start of moreNotifs
    moreNotifs = "\n" + singers + "\n" + moreNotifs.trimStart();
  } else {
    // this also replaces the existing singers template with an empty string
    moreNotifs = moreNotifs.replace(rxSingersTemplate, singers || "");
  }
  if (
    translatorLicenseTemplate &&
    !moreNotifs.toLocaleLowerCase().includes(translatorLicenseTemplate)
  ) {
    moreNotifs += translatorLicenseTemplate + "\n";
  }
  moreNotifs = moreNotifs.trim();
  moreNotifs = moreNotifs ? "\n" + moreNotifs + "\n" : "\n";
  /**
   * Actions:
   *  - Only replace translator template if the old translator template is non-existent or the old translator template has no `lang=` parameter
   *  - Only replace translation notes if not found in `append`
   */
  if (!translatorTemplate || !/\|\s*lang\s*=/.test(translatorTemplate)) {
    translatorTemplate = newTranslatorTemplate || "";
  } else if (newTranslatorTemplate) {
    translatorTemplate += "\n" + newTranslatorTemplate;
  }
  if (translationNotes && !rxTranslationNotes.test(append)) {
    append = "\n" + translationNotes + append;
  }
  /**
   * Always replace toggleText and lyrics
   */
  const sb = `${toggleText}${moreNotifs}${lyrics}${translatorTemplate ? "\n" : ""}${translatorTemplate}${append}`;
  return sb;
}