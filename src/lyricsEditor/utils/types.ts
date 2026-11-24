export interface ILyricsRow {
  customStyle: string;
  original: string;
  romanized?: string;
  english?: string;
  additionalColumns?: string[];
}

export interface MultiSelectItem {
  label: string;
  value: number;
}

/**
 * These headers should not be localized
 */
export enum LyricsTableHeader {
  STYLE = "Custom style",
  ORIGINAL = "Original",
  ROMANIZED = "Romanized",
  ENGLISH = "English",
}