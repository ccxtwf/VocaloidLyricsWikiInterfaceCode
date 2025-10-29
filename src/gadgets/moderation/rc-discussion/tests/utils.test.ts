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

import { expectedParsedRss, expectedParsedApiRcs, expectedCombinedOutput } from "./case-1.js";
import { beforeGrouping, expectedGroupingResults } from "./groups.js";

describe('RecentDiscussions: Successfully parse the Recent Changes RSS Feed', () => {
  const gotResults = (() => {
    const rssBody = readFileSync(resolve(__dirname, "./rss-1.txt"), { encoding: 'utf-8' });
    return parseRcFeeds(new DOMParser(), rssBody);
  })();
  
  test('simple case - a new comment made on an existing page', () => {
    expect(gotResults[0]).toEqual(expectedParsedRss[0]);
  });
  test('simple case - a new comment reply', () => {
    expect(gotResults[1]).toEqual(expectedParsedRss[1]);
  });
  test('simple case - a new page that is made using DiscussionTools', () => {
    expect(gotResults[2]).toEqual(expectedParsedRss[2]);
  });
  test('simple case - a new page (new topic) made without a comment topic', () => {
    expect(gotResults[3]).toEqual(expectedParsedRss[3]);
  });
  test('simple case - a long comment', () => {
    expect(gotResults[4]).toEqual(expectedParsedRss[4]);
  });
  test('simple case - an edit by an anonymous user', () => {
    expect(gotResults[5]).toEqual(expectedParsedRss[5]);
  });
  test('simple case - a comment (new page) that contains special characters', () => {
    expect(gotResults[6]).toEqual(expectedParsedRss[6]);
  });
  test('simple case - a comment (existing page) that contains special characters', () => {
    expect(gotResults[7]).toEqual(expectedParsedRss[7]);
  });
  test('simple case - a comment with a custom user signature 1', () => {
    expect(gotResults[8]).toEqual(expectedParsedRss[8]);
  });
  test('simple case - a comment with a custom user signature 2', () => {
    expect(gotResults[9]).toEqual(expectedParsedRss[9]);
  });
})

describe('RecentDiscussions: Successfully parse the Recent Changes Query API', () => {
  const gotResults = (() => {
    const rcApiRes: IExpectedApiQueryRcResponse = JSON.parse(
      readFileSync(resolve(__dirname, "./rc-api-1.txt"), { encoding: 'utf-8' })
    );
    return parseRcApiQuery(rcApiRes); 
  })();

  test('simple case - a new comment made on an existing page', () => {
    expect(gotResults[0]).toEqual(expectedParsedApiRcs[0]);
  });
  test('simple case - a new comment reply', () => {
    expect(gotResults[1]).toEqual(expectedParsedApiRcs[1]);
  });
  test('simple case - a new page that is made using DiscussionTools', () => {
    expect(gotResults[2]).toEqual(expectedParsedApiRcs[2]);
  });
  test('simple case - a new page (new topic) made without a comment topic', () => {
    expect(gotResults[3]).toEqual(expectedParsedApiRcs[3]);
  });
  test('simple case - a long comment', () => {
    expect(gotResults[4]).toEqual(expectedParsedApiRcs[4]);
  });
  test('simple case - an edit by an anonymous user', () => {
    expect(gotResults[5]).toEqual(expectedParsedApiRcs[5]);
  });
  test('simple case - a comment (new page) that contains special characters', () => {
    expect(gotResults[6]).toEqual(expectedParsedApiRcs[6]);
  });
  test('simple case - a comment (existing page) that contains special characters', () => {
    expect(gotResults[7]).toEqual(expectedParsedApiRcs[7]);
  });
  test('simple case - a comment with a custom user signature 1', () => {
    expect(gotResults[8]).toEqual(expectedParsedApiRcs[8]);
  });
  test('simple case - a comment with a custom user signature 2', () => {
    expect(gotResults[9]).toEqual(expectedParsedApiRcs[9]);
  });
});

describe('RecentDiscussions: Compare both feedrecentchanges & query API outputs', () => {
  test('simple case', () => {
    const [gotCombined, gotMap] = compareParsedRcs(new DOMParser(), [...expectedParsedRss], [...expectedParsedApiRcs]);
    expect(gotMap.size).toBe(0);
    expect(gotCombined).toEqual(expectedCombinedOutput);
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