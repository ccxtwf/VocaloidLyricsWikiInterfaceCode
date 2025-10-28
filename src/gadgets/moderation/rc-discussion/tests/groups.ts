import type {  
  IParsedApiQueryRc,
  IGroupedParsedApiQueryRc
} from "../types.js";

export const beforeGrouping: IParsedApiQueryRc[] = [
  {
    pageId: 1,
    pageTitle: 'Page 1',
    heading: 'Post #1 - 20 January 2025',
    username: 'NewUser',
    isAnon: false,
    timestamp: Date.parse('2025-01-20T14:00:10Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 1,
    toRev: 2,
    contents: 'lorem ipsum'
  },
  {
    pageId: 1,
    pageTitle: 'Page 1',
    heading: 'Post #2 - 20 January 2025',
    username: 'NewUser',
    isAnon: false,
    timestamp: Date.parse('2025-01-20T13:00:10Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 4,
    toRev: 3,
    contents: 'lorem ipsum'
  },
  {
    pageId: 2,
    pageTitle: 'Page 2',
    heading: 'Post #3 - 20 January 2025',
    username: 'NewUser',
    isAnon: false,
    timestamp: Date.parse('2025-01-20T10:00:10Z'),
    isReply: true,
    isNewTopic: false,
    fromRev: 6,
    toRev: 5,
    contents: 'lorem ipsum'
  },
  {
    pageId: 1,
    pageTitle: 'Page 1',
    heading: 'Post #4 - 20 January 2025',
    username: 'NewUser',
    isAnon: false,
    timestamp: Date.parse('2025-01-19T17:10:10Z'),
    isReply: true,
    isNewTopic: true,
    fromRev: 8,
    toRev: 7,
    contents: 'lorem ipsum'
  },
  {
    pageId: 5,
    pageTitle: 'Page 5',
    heading: 'Post #1 - 19 January 2025',
    username: 'NewUser',
    isAnon: false,
    timestamp: Date.parse('2025-01-18T23:20:04Z'),
    isReply: true,
    isNewTopic: true,
    fromRev: 10,
    toRev: 9,
    contents: 'lorem ipsum'
  },
  {
    pageId: 2,
    pageTitle: 'Page 2',
    heading: 'Post #2 - 19 January 2025',
    username: 'NewUser',
    isAnon: false,
    timestamp: Date.parse('2025-01-18T20:20:04Z'),
    isReply: true,
    isNewTopic: true,
    fromRev: 12,
    toRev: 11,
    contents: 'lorem ipsum'
  },
  {
    pageId: 2,
    pageTitle: 'Page 2',
    heading: 'Post #1 - 18 January 2025',
    username: 'NewUser',
    isAnon: false,
    timestamp: Date.parse('2025-01-18T13:09:04Z'),
    isReply: true,
    isNewTopic: true,
    fromRev: 12,
    toRev: 11,
    contents: 'lorem ipsum'
  },
  {
    pageId: 2,
    pageTitle: 'Page 2',
    heading: 'Post #1 - 17 January 2025',
    username: 'NewUser',
    isAnon: false,
    timestamp: Date.parse('2025-01-17T16:09:04Z'),
    isReply: true,
    isNewTopic: true,
    fromRev: 14,
    toRev: 13,
    contents: 'lorem ipsum'
  }
];
export const expectedGroupingResults: IGroupedParsedApiQueryRc = {
  '2025-01-20': [
    {
      pageId: 1,
      pageTitle: 'Page 1',
      heading: 'Post #1 - 20 January 2025',
      username: 'NewUser',
      isAnon: false,
      timestamp: Date.parse('2025-01-20T14:00:10Z'),
      isReply: false,
      isNewTopic: true,
      fromRev: 1,
      toRev: 2,
      contents: 'lorem ipsum'
    },
    {
      pageId: 1,
      pageTitle: 'Page 1',
      heading: 'Post #2 - 20 January 2025',
      username: 'NewUser',
      isAnon: false,
      timestamp: Date.parse('2025-01-20T13:00:10Z'),
      isReply: false,
      isNewTopic: true,
      fromRev: 4,
      toRev: 3,
      contents: 'lorem ipsum'
    },
    {
      pageId: 2,
      pageTitle: 'Page 2',
      heading: 'Post #3 - 20 January 2025',
      username: 'NewUser',
      isAnon: false,
      timestamp: Date.parse('2025-01-20T10:00:10Z'),
      isReply: true,
      isNewTopic: false,
      fromRev: 6,
      toRev: 5,
      contents: 'lorem ipsum'
    },
    {
      pageId: 1,
      pageTitle: 'Page 1',
      heading: 'Post #4 - 20 January 2025',
      username: 'NewUser',
      isAnon: false,
      timestamp: Date.parse('2025-01-19T17:10:10Z'),
      isReply: true,
      isNewTopic: true,
      fromRev: 8,
      toRev: 7,
      contents: 'lorem ipsum'
    }
  ],
  '2025-01-19': [
    {
      pageId: 5,
      pageTitle: 'Page 5',
      heading: 'Post #1 - 19 January 2025',
      username: 'NewUser',
      isAnon: false,
      timestamp: Date.parse('2025-01-18T23:20:04Z'),
      isReply: true,
      isNewTopic: true,
      fromRev: 10,
      toRev: 9,
      contents: 'lorem ipsum'
    },
    {
      pageId: 2,
      pageTitle: 'Page 2',
      heading: 'Post #2 - 19 January 2025',
      username: 'NewUser',
      isAnon: false,
      timestamp: Date.parse('2025-01-18T20:20:04Z'),
      isReply: true,
      isNewTopic: true,
      fromRev: 12,
      toRev: 11,
      contents: 'lorem ipsum'
    }
  ],
  '2025-01-18': [
    {
      pageId: 2,
      pageTitle: 'Page 2',
      heading: 'Post #1 - 18 January 2025',
      username: 'NewUser',
      isAnon: false,
      timestamp: Date.parse('2025-01-18T13:09:04Z'),
      isReply: true,
      isNewTopic: true,
      fromRev: 12,
      toRev: 11,
      contents: 'lorem ipsum'
    }
  ],
  '2025-01-17': [
    {
      pageId: 2,
      pageTitle: 'Page 2',
      heading: 'Post #1 - 17 January 2025',
      username: 'NewUser',
      isAnon: false,
      timestamp: Date.parse('2025-01-17T16:09:04Z'),
      isReply: true,
      isNewTopic: true,
      fromRev: 14,
      toRev: 13,
      contents: 'lorem ipsum'
    }
  ]
};