import { ApiResponse } from "types-mediawiki/mw/Api";

export interface MwApiParseTocResults extends ApiResponse {
  parse?: {
    pageid: number;
    showtoc: string;
    title: string;
    tocdata: {
      extensionData: unknown[];
      sections: MwApiTocDataSection[];
    };
  };
}

export interface MwApiTocDataSection {
  index: string;
  number: string;
  tocLevel: number;
  hLevel: number;
  fromTitle: string;
  line: string;
  anchor: string;
  codepointOffset: number;
}

export type OutcomeEnum = "approved" | "rejected" | "pending" | null;

export interface TlCheckingParsedQueueItem {
  originalTitle: string;
  songAuthor: string;
  tlAuthor: string;
  link: string;
  isThirdParty: boolean;
  outcome: OutcomeEnum;
  comments: string | null;
}

export function parseTlCheckingTocData(data: MwApiParseTocResults, isThirdParty: boolean) {
  const d = data
    .parse!.tocdata.sections.filter(({ hLevel }: { hLevel: number }) => {
      return hLevel === 2;
    })
    .map(
      ({
        fromTitle,
        anchor,
        line,
      }: {
        fromTitle: string;
        anchor: string;
        line: string;
      }): TlCheckingParsedQueueItem => {
        const link = mw.util.getUrl(fromTitle) + "#" + anchor;
        const parts = line.split(/\s*\|\s*/, 3);
        const [originalTitle, songAuthor, c] = parts.length === 3 ? parts : [line, "-", "-"];
        let tlAuthor = "";
        let outcome: OutcomeEnum = null;
        let comments = null;
        if (c !== "-") {
          const m = c.match(/^(.*)\s*<span><span>(✅|❌|⏳)<\/span>\s+<b>(.*?)<\/b><\/span>/);
          if (m === null) {
            tlAuthor = c;
          } else {
            tlAuthor = m[1];
            outcome = (() => {
              switch (m[2]) {
                case "✅":
                  return "approved";
                case "❌":
                  return "rejected";
                case "⏳":
                  return "pending";
              }
              return null;
            })();
            comments = m[3];
          }
        }
        return {
          originalTitle,
          songAuthor,
          tlAuthor,
          link,
          isThirdParty,
          outcome,
          comments,
        };
      },
    );
  return d;
}