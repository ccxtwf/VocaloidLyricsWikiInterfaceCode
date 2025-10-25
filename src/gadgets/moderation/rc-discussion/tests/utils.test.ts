/**
 * Run tests on Command Line:
 * npx jest src/gadgets/moderation/rc-discussion/tests/utils.test.ts
 *  
 */ 
import { readFileSync } from "fs";
import { resolve } from "path";
import type {  
  IParsedRssRcFeed, 
  IParsedApiQueryRc, 
  // IGroupedParsedApiQueryRc,
  IExpectedApiQueryRcResponse, 
  // IExpectedApiQueryRvResponse 
} from "../types.js";
import {
	parseRcFeeds, 
	parseRcApiQuery,
	// parseRvApiQuery,
	compareParsedRcs,
	// groupDiscussionsByDate,
} from "../utils.js";

describe('simple case - get the posted comments from edits with no intermediary rev', () => {
  const expectedParsedRss: IParsedRssRcFeed[] = [
    {
      author: 'NewUser1',
      pageTitle: 'Page 1',
      heading: 'I am a new comment on an existing page!',
      textAdditions: [
        '',
        '== I am a new comment on an existing page! ==',
        '',
        'I am a new comment!!',
        '',
        '...So what\'s up with airplane food?',
        '',
        '-- [[User:NewUser1|NewUser1]] ([[User talk:NewUser1|talk]]) 08:26, 25 October 2025 (UTC)'
      ],
      timestamp: Date.parse('2025-10-25T08:26:49Z'),
      isReply: false,
      fromRev: 1, 
      toRev: 2,
      isNewPage: false,
      hasMultipleRevs: false
    },
    {
      author: 'NewUser2',
      pageTitle: 'Page 2',
      heading: 'I am a reply!',
      textAdditions: [
        '',
        ':I am a reply.',
        '',
        ':Apropos of nothing. [[User:NewUser2|NewUser2]] ([[User talk:NewUser2|talk]]) 08:25, 25 October 2025 (UTC)'
      ],
      timestamp: Date.parse('2025-10-25T08:25:30Z'),
      isReply: true,
      fromRev: 3, 
      toRev: 4,
      isNewPage: false,
      hasMultipleRevs: false
    },
    {
      author: 'NewUser3',
      pageTitle: 'Page 3',
      heading: 'I am a new page made using DiscussionTools',
      textAdditions: [
        '== I am a new page made using DiscussionTools ==\n \n lorem ipsum dolor sit amet... is how the lore goes. [[User:NewUser3|NewUser3]] ([[User talk:NewUser3|talk]]) 08:24, 25 October 2025 (UTC)'
      ],
      timestamp: Date.parse('2025-10-25T08:24:15Z'),
      isReply: false,
      fromRev: 0, 
      toRev: 5,
      isNewPage: true,
      hasMultipleRevs: false
    },
    {
      author: 'NewUser4',
      pageTitle: 'Page 4',
      heading: null,
      textAdditions: [
        'I am a comment without a topic sad emoji [[User:NewUser4|NewUser4]] ([[User talk:NewUser4|talk]]) 08:23, 25 October 2025 (UTC)'
      ],
      timestamp: Date.parse('2025-10-25T08:23:01Z'),
      isReply: false,
      fromRev: 0, 
      toRev: 6,
      isNewPage: true,
      hasMultipleRevs: false
    }
  ];
  const expectedParsedApiRcs: IParsedApiQueryRc[] = [
    {
      pageId: 1,
      pageTitle: 'Page 1',
      heading: 'I am a new comment on an existing page!',
      username: 'NewUser1',
      timestamp: Date.parse('2025-10-25T08:26:49Z'),
      isReply: false,
      isNewTopic: true,
      fromRev: 1,
      toRev: 2,
      contents: null
    },
    {
      pageId: 2,
      pageTitle: 'Page 2',
      heading: 'I am a reply!',
      username: 'NewUser2',
      timestamp: Date.parse('2025-10-25T08:25:30Z'),
      isReply: true,
      isNewTopic: false,
      fromRev: 3,
      toRev: 4,
      contents: null
    },
    {
      pageId: 3,
      pageTitle: 'Page 3',
      heading: 'I am a new page made using DiscussionTools',
      username: 'NewUser3',
      timestamp: Date.parse('2025-10-25T08:24:15Z'),
      isReply: false,
      isNewTopic: true,
      fromRev: 0,
      toRev: 5,
      contents: null
    },
    {
      pageId: 4,
      pageTitle: 'Page 4',
      heading: null,
      username: 'NewUser4',
      timestamp: Date.parse('2025-10-25T08:23:01Z'),
      isReply: false,
      isNewTopic: true,
      fromRev: 0,
      toRev: 6,
      contents: null
    }
  ];
  const expectedCombinedOutput: IParsedApiQueryRc[] = [
    {
      pageId: 1,
      pageTitle: 'Page 1',
      heading: 'I am a new comment on an existing page!',
      username: 'NewUser1',
      timestamp: Date.parse('2025-10-25T08:26:49Z'),
      isReply: false,
      isNewTopic: true,
      fromRev: 1,
      toRev: 2,
      contents: `I am a new comment!! ...So what\'s up with airplane food? --`
    },
    {
      pageId: 2,
      pageTitle: 'Page 2',
      heading: 'I am a reply!',
      username: 'NewUser2',
      timestamp: Date.parse('2025-10-25T08:25:30Z'),
      isReply: true,
      isNewTopic: false,
      fromRev: 3,
      toRev: 4,
      contents: `I am a reply. Apropos of nothing.`
    },
    {
      pageId: 3,
      pageTitle: 'Page 3',
      heading: 'I am a new page made using DiscussionTools',
      username: 'NewUser3',
      timestamp: Date.parse('2025-10-25T08:24:15Z'),
      isReply: false,
      isNewTopic: true,
      fromRev: 0,
      toRev: 5,
      contents: `lorem ipsum dolor sit amet... is how the lore goes.`
    },
    {
      pageId: 4,
      pageTitle: 'Page 4',
      heading: null,
      username: 'NewUser4',
      timestamp: Date.parse('2025-10-25T08:23:01Z'),
      isReply: false,
      isNewTopic: true,
      fromRev: 0,
      toRev: 6,
      contents: `I am a comment without a topic sad emoji`
    }
  ];
  test('Parse from Recent Changes RSS Feed', () => {
    const rssBody = readFileSync(resolve(__dirname, "./rss-1.txt"), { encoding: 'utf-8' });
    const gotResults = parseRcFeeds(rssBody);
    expect(gotResults).toEqual(expectedParsedRss);
  });
  test('Parse from Recent Changes Query API', () => {
    const rcApiRes: IExpectedApiQueryRcResponse = JSON.parse(
      readFileSync(resolve(__dirname, "./rc-api-1.txt"), { encoding: 'utf-8' })
    );
    const gotResults = parseRcApiQuery(rcApiRes);
    expect(gotResults).toEqual(expectedParsedApiRcs);
  });
  test('Compare both outputs', () => {
    const [gotCombined, gotMap] = compareParsedRcs([...expectedParsedRss], [...expectedParsedApiRcs]);
    expect(gotMap.size).toBe(0);  // No intermediary rev
    expect(gotCombined).toEqual(expectedCombinedOutput);
  })
});