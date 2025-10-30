import type {  
  IParsedRssRcFeed, 
  IParsedApiQueryRc,
} from "../types.js";

export const expectedParsedRss2: IParsedRssRcFeed[] = [
  {
    author: 'ExampleUser',
    pageTitle: 'Page 2',
    heading: 'Comment 6',
    textAdditions: [
      '',
      ':I\'m replying to this comment. [[User:ExampleUser|ExampleUser]] ([[User talk:ExampleUser|talk]]) 08:03, 30 October 2025 (UTC)'
    ],
    timestamp: Date.parse('2025-10-30T08:03:04Z'),
    isReply: true,
    fromRev: 801, 
    toRev: 804,
    isNewPage: false,
    hasMultipleRevs: false
  },
  {
    author: 'ExampleUser',
    pageTitle: 'Page 3',
    heading: 'Comment 8',
    textAdditions: [
      '== Comment 8 ==', 
      '', '', '',
      'abc [[User:ExampleUser|ExampleUser]] ([[User talk:ExampleUser|talk]]) 08:02, 30 October 2025 (UTC)'
    ],
    timestamp: Date.parse('2025-10-30T08:02:48Z'),
    isReply: false,
    fromRev: 0, 
    toRev: 803,
    isNewPage: true,
    hasMultipleRevs: false
  },
  {
    author: 'ExampleUser',
    pageTitle: 'Page 1',
    heading: 'Comment 7',
    textAdditions: [
      '',
      '== Comment 7 ==', 
      '',
      'one, two, three [[User:ExampleUser|ExampleUser]] ([[User talk:ExampleUser|talk]]) 08:02, 30 October 2025 (UTC)'
    ],
    timestamp: Date.parse('2025-10-30T08:02:25Z'),
    isReply: false,
    fromRev: 800, 
    toRev: 802,
    isNewPage: false,
    hasMultipleRevs: false
  },
  {
    author: 'ExampleUser',
    pageTitle: 'Page 2',
    heading: 'Comment 6',
    textAdditions: [
      '',
      '== Comment 6 ==', 
      '',
      'Back where I started. [[User:ExampleUser|ExampleUser]] ([[User talk:ExampleUser|talk]]) 07:49, 30 October 2025 (UTC)'
    ],
    timestamp: Date.parse('2025-10-30T07:49:49Z'),
    isReply: false,
    fromRev: 799, 
    toRev: 801,
    isNewPage: false,
    hasMultipleRevs: false
  },
  {
    author: 'ExampleUser',
    pageTitle: 'Page 1',
    heading: 'Comment 5',
    textAdditions: [
      '',
      '== Comment 5 ==', 
      '',
      'Still I rise. [[User:ExampleUser|ExampleUser]] ([[User talk:ExampleUser|talk]]) 07:49, 30 October 2025 (UTC)'
    ],
    timestamp: Date.parse('2025-10-30T07:49:28Z'),
    isReply: false,
    fromRev: 797, 
    toRev: 800,
    isNewPage: false,
    hasMultipleRevs: false
  },
  {
    author: 'ExampleUser',
    pageTitle: 'Page 2',
    heading: 'Comment 4',
    textAdditions: null,
    timestamp: Date.parse('2025-10-30T07:49:17Z'),
    isReply: true,
    fromRev: 792, 
    toRev: 799,
    isNewPage: false,
    hasMultipleRevs: true
  },
  {
    author: 'ExampleUser',
    pageTitle: 'Page 1',
    heading: 'Comment 3',
    textAdditions: null,
    timestamp: Date.parse('2025-10-30T07:45:21Z'),
    isReply: false,
    fromRev: 795, 
    toRev: 797,
    isNewPage: false,
    hasMultipleRevs: true
  },
  {
    author: 'ExampleUser',
    pageTitle: 'Page 1',
    heading: 'Comment 1',
    textAdditions: [
      '== Comment 1 ==', 
      '', '', '',
      'I am comment 1 (NEW PAGE) [[User:ExampleUser|ExampleUser]] ([[User talk:ExampleUser|talk]]) 07:44, 30 October 2025 (UTC)'
    ],
    timestamp: Date.parse('2025-10-30T07:44:07Z'),
    isReply: false,
    fromRev: 0, 
    toRev: 795,
    isNewPage: true,
    hasMultipleRevs: false
  }
];
export const expectedParsedApiRcs2: IParsedApiQueryRc[] = [
  {
    pageId: 788,
    pageTitle: 'Page 2',
    heading: 'Comment 6',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T08:03:04Z'),
    isReply: true,
    isNewTopic: false,
    fromRev: 801,
    toRev: 804,
    contents: null
  },
  {
    pageId: 791,
    pageTitle: 'Page 3',
    heading: 'Comment 8',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T08:02:48Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 803,
    contents: null
  },
  {
    pageId: 790,
    pageTitle: 'Page 1',
    heading: 'Comment 7',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T08:02:25Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 800,
    toRev: 802,
    contents: null
  },
  {
    pageId: 788,
    pageTitle: 'Page 2',
    heading: 'Comment 6',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:49:49Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 799,
    toRev: 801,
    contents: null
  },
  {
    pageId: 790,
    pageTitle: 'Page 1',
    heading: 'Comment 5',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:49:28Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 797,
    toRev: 800,
    contents: null
  },
  {
    pageId: 788,
    pageTitle: 'Page 2',
    heading: 'Comment 4',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:49:17Z'),
    isReply: true,
    isNewTopic: false,
    fromRev: 798,
    toRev: 799,
    contents: null
  },
  {
    pageId: 788,
    pageTitle: 'Page 2',
    heading: 'Comment 4',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:49:03Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 792,
    toRev: 798,
    contents: null
  },
  {
    pageId: 790,
    pageTitle: 'Page 1',
    heading: 'Comment 3',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:45:21Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 796,
    toRev: 797,
    contents: null
  },
  {
    pageId: 790,
    pageTitle: 'Page 1',
    heading: 'Comment 2',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:44:22Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 795,
    toRev: 796,
    contents: null
  },
  {
    pageId: 790,
    pageTitle: 'Page 1',
    heading: 'Comment 1',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:44:07Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 795,
    contents: null
  }
];
export const expectedCombinedOutput2: IParsedApiQueryRc[] = [
  {
    pageId: 788,
    pageTitle: 'Page 2',
    heading: 'Comment 6',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T08:03:04Z'),
    isReply: true,
    isNewTopic: false,
    fromRev: 801,
    toRev: 804,
    contents: 'I\'m replying to this comment.'
  },
  {
    pageId: 791,
    pageTitle: 'Page 3',
    heading: 'Comment 8',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T08:02:48Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 803,
    contents: 'abc'
  },
  {
    pageId: 790,
    pageTitle: 'Page 1',
    heading: 'Comment 7',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T08:02:25Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 800,
    toRev: 802,
    contents: 'one, two, three'
  },
  {
    pageId: 788,
    pageTitle: 'Page 2',
    heading: 'Comment 6',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:49:49Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 799,
    toRev: 801,
    contents: 'Back where I started.'
  },
  {
    pageId: 790,
    pageTitle: 'Page 1',
    heading: 'Comment 5',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:49:28Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 797,
    toRev: 800,
    contents: 'Still I rise.'
  },
  {
    pageId: 788,
    pageTitle: 'Page 2',
    heading: 'Comment 4',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:49:17Z'),
    isReply: true,
    isNewTopic: false,
    fromRev: 798,
    toRev: 799,
    contents: null
  },
  {
    pageId: 788,
    pageTitle: 'Page 2',
    heading: 'Comment 4',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:49:03Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 792,
    toRev: 798,
    contents: null
  },
  {
    pageId: 790,
    pageTitle: 'Page 1',
    heading: 'Comment 3',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:45:21Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 796,
    toRev: 797,
    contents: null
  },
  {
    pageId: 790,
    pageTitle: 'Page 1',
    heading: 'Comment 2',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:44:22Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 795,
    toRev: 796,
    contents: null
  },
  {
    pageId: 790,
    pageTitle: 'Page 1',
    heading: 'Comment 1',
    username: 'ExampleUser',
    isAnon: false,
    timestamp: Date.parse('2025-10-30T07:44:07Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 795,
    contents: 'I am comment 1 (NEW PAGE)'
  }
];