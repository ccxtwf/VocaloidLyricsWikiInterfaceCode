import type {  
  IParsedRssRcFeed, 
  IParsedApiQueryRc, 
  IGroupedParsedApiQueryRc,
  IExpectedApiQueryRcResponse, 
  IExpectedApiQueryRvResponse 
} from "./types.js";

/**
 * For testing environments
 */
function getParamValue(param: string, url: string): string | null {
  return new URL(url).searchParams.get(param);
}

/**
 * Parses the response from `api.php?action=feedrecentchanges`
 * 
 * `rc-discussion` will always prioritize extracting diffs from `feedrecentchanges`,
 * unless if a talk page on the wiki has multiple DiscussionTools-tagged edits 
 * associated with it.
 *
 * Because `feedrecentchanges` groups multiple edits associated with a page into one
 * RSS feed item, we are unable to separate intermediary edits (i.e. each separate 
 * topic addition or reply addition) from the results of `feedrecentchanges`. We'd 
 * like to defer to MediaWiki's query API in such cases (see `parseRvApiQuery()`).  
 * 
 * @param rss 
 * @returns 
 */
export function parseRcFeeds(rss: string): IParsedRssRcFeed[] {
  const parser = new window.DOMParser();
  const data = parser.parseFromString(rss, "application/xml");
  const items = Array.from(data.querySelectorAll("item"));

  return items.map((item: Element) => {
    const xmlString = decodeXmlContents(item.querySelector("description")?.innerHTML);
    const pageTitle = item.querySelector("title")?.innerHTML;
    const author = item.getElementsByTagName('dc:creator')[0].innerHTML;
    const rTimestamp = item.querySelector("pubDate")?.innerHTML;
    const timestamp = (!rTimestamp) ? null : Date.parse(rTimestamp);
    const link = decodeXmlContents(item.querySelector("link")?.innerHTML);
    
    const doc = parser.parseFromString(`<html>${xmlString}</html>`, 'application/xml');
    
    const fromRev = +(getParamValue("oldid", link) || 0);
    const toRev = +(getParamValue("diff", link) || 0);
    const isNewPage = (fromRev === 0);
    
    const hasMultipleRevs = doc.querySelector('td.diff-multi') !== null;
    
    const summaryNode = doc.querySelector('p:first-child');
    const commentHeadingNode = summaryNode?.querySelector('span.autocomment') || null;
    let commentHeading = null;
    let commentType = null;
    let isReply = false;
    if (commentHeadingNode !== null) {
      commentHeading = ((commentHeadingNode as Element).textContent).replace(/\s*:\s*$/, '');
      commentType = (summaryNode?.innerHTML || '').replace((commentHeadingNode as Element).outerHTML, '').trim();
      if (commentType === 'Reply') { isReply = true; }
    }
    
    let textAdditions: string[] | null = null;
    if (isNewPage) {
      textAdditions = Array.from(doc.documentElement.children).slice(2)
      .map((el: Element) => el.innerHTML.replace(/<br\s*\/?>/g, '\n'))
      .map((s: string) => {
        // Trim unneeded whitespace
        while (s.match(/^[\n ]*<br\s?\/>[\n ]*/) !== null) {
          s = s.replace(/^[\n ]*<br\s?\/>[\n ]*/, '');
        }
        return s;
      });
    } else if (!hasMultipleRevs) {
      textAdditions = parseNewAdditionDiffs(doc);
    }
    
    return { 
      author, 
      pageTitle: pageTitle!, 
      heading: commentHeading,
      textAdditions,
      timestamp, 
      isReply,
      fromRev, 
      toRev, 
      isNewPage, 
      hasMultipleRevs
    };
  });
}

/**
 * Parses the response from `api.php?action=query&list=recentchanges`
 * 
 * Unlike `feedrecentchanges`, MediaWiki's Query API (list=recentchanges) is 
 * not able to fetch the MediaWiki page diffs associated with each topic/reply 
 * addition.
 * 
 * @param res 
 * @returns 
 */
export function parseRcApiQuery(res: IExpectedApiQueryRcResponse): IParsedApiQueryRc[] {
  const discussions = (res.query.recentchanges || []).map((curComment) => {
    let { 
      title: pageTitle, 
      pageid: pageId, 
      'old_revid': fromRev, 
      revid: toRev, 
      comment: revSummary, 
      user: username
    } = curComment;
    const isReply = (curComment.tags || []).indexOf("discussiontools-reply") > -1;
    const isNewTopic = (curComment.tags || []).indexOf("discussiontools-newtopic") > -1;
    const timestamp = ((curComment.timestamp || '') === '') ? null : Date.parse(curComment.timestamp);
    let heading: string | null = null;
    if (fromRev === 0 && revSummary.startsWith('Created page with')) {
      // Do nothing
    } else if (isReply) {
      heading = revSummary.slice(3, revSummary.length - ("Reply".length) - 4);
    } else if (isNewTopic) {
      heading = revSummary.slice(3, revSummary.length - ("new section".length) - 4);
    }
    return {
      pageId,
      pageTitle,
      heading,
      username,
      timestamp,
      isReply,
      isNewTopic,
      fromRev,
      toRev,
      contents: null
    };
  });
  return discussions;
}

/**
 * Normalizes the results of `parseRcFeeds` and `parseRcApiQuery` into one output.
 * Modifies `parsedApiQuery` in-place.
 * 
 * Also determines the intermediary revisions which `parseRcFeeds` is not able 
 * to get the (separated) contents of. In such cases, a third API request to the 
 * wiki will be made and the fetched API response will be passed onto `parseRvApiQuery`. 
 * 
 * @param parsedFeeds
 * @param parsedApiQuery 
 * @returns 
 */
export function compareParsedRcs(parsedFeeds: IParsedRssRcFeed[], parsedApiQuery: IParsedApiQueryRc[]): [IParsedApiQueryRc[], Map<number, number>] {
  let idxApiQuery = 0;
  let idxFeeds = 0;
  const atIndexes: number[] = [];
  const fetchMidRevs: number[] = [];
  while (idxApiQuery < parsedApiQuery.length) {

    // Reached end of parsedFeeds, let the remaining parsedApiQuery items be 
    // passed onto the next API request (to fetch text contents)
    if (idxFeeds >= parsedFeeds.length) {
      atIndexes.push(idxApiQuery);
      fetchMidRevs.push(parsedApiQuery[idxApiQuery].toRev);
      idxApiQuery++;
      continue;
    }

    if (
      parsedApiQuery[idxApiQuery].fromRev === parsedFeeds[idxFeeds].fromRev && 
      parsedApiQuery[idxApiQuery].toRev === parsedFeeds[idxFeeds].toRev
    ) {
      // Matching single edit
      parsedApiQuery[idxApiQuery].contents = buildStringFromDiffs(
        parsedFeeds[idxFeeds].textAdditions || [], 
        parsedFeeds[idxFeeds].heading, 
        parsedFeeds[idxFeeds].isReply
      );
      idxApiQuery++;
      idxFeeds++;
    } else if (parsedFeeds[idxFeeds].hasMultipleRevs) {
      // Intermediary rev
      do {
        atIndexes.push(idxApiQuery);
        fetchMidRevs.push(parsedApiQuery[idxApiQuery].toRev);
        idxApiQuery++;
      } while (idxApiQuery < parsedApiQuery.length && parsedApiQuery[idxApiQuery-1].fromRev !== parsedFeeds[idxFeeds].fromRev);
      idxFeeds++;
    } else {
      // Something is wrong... Try to fetch the extra information anyway
      atIndexes.push(idxApiQuery);
      fetchMidRevs.push(parsedApiQuery[idxApiQuery].toRev);
      idxApiQuery++;
      idxFeeds++;
    }
  }

  // Map MediaWiki Revision ID to Position Index in parsedApiQuery
  const revToIdx = new Map<number, number>();
  for (let i = 0; i < fetchMidRevs.length; i++) {
    revToIdx.set(fetchMidRevs[i], atIndexes[i]);
  }

  return [parsedApiQuery, revToIdx];
}

/**
 * For intermediary revs (between multiple edits on a single page) for which 
 * `parseRcFeeds` is not able to get the separated diff contents, a third API 
 * request is made to MediaWiki's Query API (prop=revisions), to fetch the associated 
 * diffs of each intermediary edit. This function then processes the returned 
 * API response and modifies the output of `compareParsedRcs` directly.
 * 
 * @param res           API Response
 * @param parsedApiRcs  Output from `compareParsedRcs`
 * @param revToIdx      Map of MW Revision ID -> Position index on parsedApiRcs  
 */
export function parseRvApiQuery(res: IExpectedApiQueryRvResponse, parsedApiRcs: IParsedApiQueryRc[], revToIdx: Map<number, number>): void {
  const parser = new window.DOMParser();
  const objs = Object.values(res.query.pages || {});
  for (const obj of objs) {
    const revs = obj.revisions || [];
    revs.forEach((rev) => {
      const revid = rev.revid;
      let diffs: string | undefined = (rev.diff || {})['*'];
      if (diffs !== undefined) {
        const atIndex = revToIdx.get(revid)!;
        parsedApiRcs[atIndex].contents = ((diffs: string, atIndex: number) => {
          const d = parser.parseFromString(`<html><table>${diffs}</table></html>`, 'application/xml');
          const arrd = parseNewAdditionDiffs(d);
          const comment = buildStringFromDiffs(
            arrd, 
            parsedApiRcs[atIndex].heading, 
            parsedApiRcs[atIndex].isReply
          );
          return comment;
        })(diffs, atIndex);
      }
    })
  }
}

/**
 * Groups the parsed edits by date using local time
 * 
 * @param items 
 * @returns 
 */
export function groupDiscussionsByDate(items: IParsedApiQueryRc[]): IGroupedParsedApiQueryRc {
  const res: IGroupedParsedApiQueryRc = {};
  let prevDate: string | null = null;
  for (const item of items) {
    const curDate = item.timestamp === null ? '' : 
      new Date(item.timestamp).toLocaleString(navigator.language || 'en', { 
        'year': 'numeric', 'month': 'long', 'day': 'numeric'
      });
    if (prevDate !== curDate) {
      res[curDate] = [];
      prevDate = curDate;
    }
    res[curDate].push(item);
  }
  return res;
}

/**
 * 
 * @param text 
 * @returns 
 */
export function decodeXmlContents(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/&(lt|gt|amp|apos|quot);/g, (_: string, t: string): string => {
    switch (t) {
      case 'lt': 
        return '<';
      case 'gt': 
        return '>';
      case 'amp': 
        return '&';
      case 'apos': 
        return '\'';
      case 'quot': 
        return '"';
    }
    return '';
  });
}

/**
 * 
 * @param string 
 * @returns 
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Removes links that are written in wikitext syntax from a string
 * 
 * @param text 
 * @returns 
 */
export function stripLinks(text: string): string {
  text = text.replace(/\[\[([^\|\]]+)\]\]/g, '$1');
  text = text.replace(/\[\[([^\|\]]+)\|([^\|\]]*)\]\]/g, '$2');
  text = text.replace(/\[(https?:\/\/[^ \]]+)\s*([^\]]*)\]/g, '$2');
  return text;
}

/**
 * Strips common wikitext tags
 * 
 * @param text 
 * @returns 
 */
export function stripTags(text: string): string {
  text = text.replace(/<(nowiki|includeonly|noinclude|mobileonly|nomobile|code|blockquote)>(.*?)<\/\1>/g, "$2");
  return text;
}

/**
 * Fetches new text addition from MediaWiki diffs.
 * 
 * @param doc 
 * @returns 
 */
export function parseNewAdditionDiffs(doc: Document): string[] {
  const diffRows = Array.from(doc.querySelectorAll('table > tr:not(.diff-title)'));
  const diffs = diffRows
    .filter((tr: Element) => {
      return tr.querySelector('td.diff-empty.diff-side-deleted') !== null;
    })
    .map((tr: Element) => {
      return tr.querySelector('td:not(.diff-empty):not(.diff-side-deleted):not(.diff-marker)');
    })
    .map((td: Element | null) => { 
      return decodeXmlContents(td?.textContent.trim()); 
    });
  return diffs;
}

/**
 * Processes the results returned from `parseNewAdditionDiffs` and build the string
 * representing the associated text content.
 * 
 * Does a few other things like removing formatting.
 * 
 * @param diffs 
 * @param filterHeading 
 * @param isReply 
 * @returns 
 */
export function buildStringFromDiffs(diffs: string[], filterHeading: string | null, isReply: boolean): string {
  const rxTaggedSignature = /\s*\[\[User:[^\]]+?\]\]\s+\(\[\[User[ _]talk:[^\]\|]+?\|talk\]\]\)\s+\d{1,2}:\d{1,2},\s+\d{1,2}\s+[a-zA-Z]+\s+\d{4}\s+\(UTC\)\s*$/;
  const rxHeadingWikitext = new RegExp("(?<=^|\\n|<br\\s?\\/?>)={2}\\s*" + escapeRegExp(filterHeading || '').replace(/[ _]/g, '[ _]') + "\\s*={2}(?=\\n|<br\\s?\/?>|$)");
  
  // Clear heading
  diffs = diffs
    .map(txt => filterHeading !== null ? txt.replace(rxHeadingWikitext, '') : txt)
    .filter(txt => txt.trim() !== '');
  // Remove reply wikitext syntax
  if (isReply) { diffs = diffs.map(s => s.replace(/^:+\s*/, '')); }
  // Remove tagged signature
  diffs = diffs.map(s => s.replace(rxTaggedSignature, ''));
  // Trim unneeded whitespace
  while (diffs.length > 0 && diffs[0] === '') { diffs.shift(); }
  while (diffs.length > 0 && diffs[diffs.length-1] === '') { diffs.pop(); }
  // Build string
  return stripTags(stripLinks(diffs.join(' ').trim()));
}