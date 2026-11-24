import l10n from "./en.json";

export function translate(key: string, ...params: unknown[]): string {
  let raw = (l10n as Record<string, string>)[key];
  if (!raw) {
    console.error(`[Handsontable] Cannot find localization message for '${key}'`);
    return key;
  }
  for (let i = 1; i <= params.length; i++) {
    raw = raw.replaceAll(`$${i}`, String(params[i - 1]));
  }
  return raw;
}