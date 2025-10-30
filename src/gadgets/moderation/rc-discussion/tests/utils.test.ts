/**
 * Run tests on Command Line:
 * npx jest src/gadgets/moderation/rc-discussion/tests/utils.test.ts
 *  
 */ 
import { readFileSync } from "fs";
import { resolve } from "path";
import type {
  IExpectedApiQueryRcResponse, 
  // IExpectedApiQueryRvResponse 
} from "../types.js";
import {
	parseRcFeeds, 
	parseRcApiQuery,
	// parseRvApiQuery,
	compareParsedRcs,
	groupDiscussionsByDate,
} from "../utils.js";

import { expectedParsedRss1, expectedParsedApiRcs1, expectedCombinedOutput1 } from "./case-1.js";
import { expectedParsedRss2, expectedParsedApiRcs2, expectedCombinedOutput2 } from "./case-2.js";
import { beforeGrouping, expectedGroupingResults } from "./groups.js";

describe('RecentDiscussions: Successfully parse the Recent Changes RSS Feed', () => {
  const gotResults1 = (() => {
    const rssBody = readFileSync(resolve(__dirname, "./rss-1.txt"), { encoding: 'utf-8' });
    return parseRcFeeds(new DOMParser(), rssBody);
  })();
  
  test('simple case - a new comment made on an existing page', () => {
    expect(gotResults1[0]).toEqual(expectedParsedRss1[0]);
  });
  test('simple case - a new comment reply', () => {
    expect(gotResults1[1]).toEqual(expectedParsedRss1[1]);
  });
  test('simple case - a new page that is made using DiscussionTools', () => {
    expect(gotResults1[2]).toEqual(expectedParsedRss1[2]);
  });
  test('simple case - a new page (new topic) made without a comment topic', () => {
    expect(gotResults1[3]).toEqual(expectedParsedRss1[3]);
  });
  test('simple case - a long comment', () => {
    expect(gotResults1[4]).toEqual(expectedParsedRss1[4]);
  });
  test('simple case - an edit by an anonymous user', () => {
    expect(gotResults1[5]).toEqual(expectedParsedRss1[5]);
  });
  test('simple case - a comment (new page) that contains special characters', () => {
    expect(gotResults1[6]).toEqual(expectedParsedRss1[6]);
  });
  test('simple case - a comment (existing page) that contains special characters', () => {
    expect(gotResults1[7]).toEqual(expectedParsedRss1[7]);
  });
  test('simple case - a comment with a custom user signature 1', () => {
    expect(gotResults1[8]).toEqual(expectedParsedRss1[8]);
  });
  test('simple case - a comment with a custom user signature 2', () => {
    expect(gotResults1[9]).toEqual(expectedParsedRss1[9]);
  });

  const gotResults2 = (() => {
    const rssBody = readFileSync(resolve(__dirname, "./rss-2.txt"), { encoding: 'utf-8' });
    return parseRcFeeds(new DOMParser(), rssBody);
  })();
  test('several consecutive comments made on a page', () => {
    expect(gotResults2).toEqual(expectedParsedRss2);
  });
  
})

describe('RecentDiscussions: Successfully parse the Recent Changes Query API', () => {
  const gotResults1 = (() => {
    const rcApiRes: IExpectedApiQueryRcResponse = JSON.parse(
      readFileSync(resolve(__dirname, "./rc-api-1.txt"), { encoding: 'utf-8' })
    );
    return parseRcApiQuery(rcApiRes); 
  })();

  test('simple case - a new comment made on an existing page', () => {
    expect(gotResults1[0]).toEqual(expectedParsedApiRcs1[0]);
  });
  test('simple case - a new comment reply', () => {
    expect(gotResults1[1]).toEqual(expectedParsedApiRcs1[1]);
  });
  test('simple case - a new page that is made using DiscussionTools', () => {
    expect(gotResults1[2]).toEqual(expectedParsedApiRcs1[2]);
  });
  test('simple case - a new page (new topic) made without a comment topic', () => {
    expect(gotResults1[3]).toEqual(expectedParsedApiRcs1[3]);
  });
  test('simple case - a long comment', () => {
    expect(gotResults1[4]).toEqual(expectedParsedApiRcs1[4]);
  });
  test('simple case - an edit by an anonymous user', () => {
    expect(gotResults1[5]).toEqual(expectedParsedApiRcs1[5]);
  });
  test('simple case - a comment (new page) that contains special characters', () => {
    expect(gotResults1[6]).toEqual(expectedParsedApiRcs1[6]);
  });
  test('simple case - a comment (existing page) that contains special characters', () => {
    expect(gotResults1[7]).toEqual(expectedParsedApiRcs1[7]);
  });
  test('simple case - a comment with a custom user signature 1', () => {
    expect(gotResults1[8]).toEqual(expectedParsedApiRcs1[8]);
  });
  test('simple case - a comment with a custom user signature 2', () => {
    expect(gotResults1[9]).toEqual(expectedParsedApiRcs1[9]);
  });
  
  const gotResults2 = (() => {
    const rcApiRes: IExpectedApiQueryRcResponse = JSON.parse(
      readFileSync(resolve(__dirname, "./rc-api-2.txt"), { encoding: 'utf-8' })
    );
    return parseRcApiQuery(rcApiRes); 
  })();
  test('several consecutive comments made on a page', () => {
    expect(gotResults2).toEqual(expectedParsedApiRcs2);
  });

});

describe('RecentDiscussions: Compare both feedrecentchanges & query API outputs', () => {
  test('simple case', () => {
    const [gotCombined, gotMap] = compareParsedRcs(new DOMParser(), [...expectedParsedRss1], [...expectedParsedApiRcs1]);
    expect(gotMap.size).toBe(0);
    expect(gotCombined).toEqual(expectedCombinedOutput1);
  });

  test('with consecutive edits on a page', () => {
    const [gotCombined, gotMap] = compareParsedRcs(new DOMParser(), [...expectedParsedRss2], [...expectedParsedApiRcs2]);
    const expectedMap = new Map<number, number>();
    expectedMap.set(799, 5);
    expectedMap.set(798, 6);
    expectedMap.set(797, 7);
    expectedMap.set(796, 8);
    
    expect(gotMap).toEqual(expectedMap);
    expect(gotCombined).toEqual(expectedCombinedOutput2);
  });
});

describe('RecentDiscussions: Successfully group discussions by date', () => {
  test('group results by date', () => {
    // Expect timezone to be UTC+7 (this should have been alr have been taken care of
    // in jest.config (globalSetup))
    expect(new Date().getTimezoneOffset()).toBe(-420);
    
    const gotResults = groupDiscussionsByDate(beforeGrouping);
    expect(Object.keys(gotResults)).toEqual(Object.keys(expectedGroupingResults));
    expect(gotResults).toEqual(expectedGroupingResults);
  })
});