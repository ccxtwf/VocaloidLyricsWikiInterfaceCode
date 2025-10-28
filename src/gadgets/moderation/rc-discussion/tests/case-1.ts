import type {  
  IParsedRssRcFeed, 
  IParsedApiQueryRc,
} from "../types.js";

export const expectedParsedRss: IParsedRssRcFeed[] = [
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
      '== I am a new page made using DiscussionTools ==', 
      '', '', '',
      'lorem ipsum dolor sit amet... is how the lore goes. [[User:NewUser3|NewUser3]] ([[User talk:NewUser3|talk]]) 08:24, 25 October 2025 (UTC)'
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
  },
  {
    author: 'NewUser5',
    pageTitle: 'Page 5',
    heading: "I am a long comment",
    textAdditions: [
      '== I am a long comment ==',
      '', '', '',
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vulputate felis vel aliquam facilisis. Fusce consectetur eros ex, sed rutrum quam dapibus in. Ut bibendum justo sit amet magna hendrerit, sed consequat dolor porta. Vestibulum rhoncus nibh id risus semper, eu ultricies mi consequat. Mauris et placerat libero. Curabitur pulvinar ac enim et maximus. Curabitur luctus lobortis est, nec ornare enim maximus eget.`,
      '', '', '',
      `Quisque dictum consequat metus in suscipit. Ut gravida risus tortor, vitae vulputate ex pretium eu. Aliquam maximus nunc sed lacus ultricies interdum. Suspendisse non dui non lorem consequat faucibus eu et sem. Pellentesque pretium leo quis tincidunt ullamcorper. Phasellus ac tempor enim. Mauris ullamcorper non ex ac molestie. Cras non sapien eu ipsum porttitor sagittis eu in orci. Fusce scelerisque aliquet elit ut dignissim. Sed bibendum dapibus tortor, eget vulputate dui lobortis quis. Morbi a scelerisque lacus, vitae pellentesque sapien. Sed arcu libero, fermentum quis tortor sit amet, venenatis lacinia nunc. Duis sit amet arcu neque. Ut finibus posuere scelerisque. In quis auctor metus, sed egestas libero.`,
      '', '', '', 
      `Nulla quis dui risus. Donec et lacinia magna. Fusce mattis sapien et mi blandit cursus. Mauris varius, nibh congue iaculis commodo, libero enim convallis ligula, in semper sem nunc vitae ligula. Vestibulum et urna ligula. Mauris dictum metus ac quam efficitur aliquet. Mauris pharetra finibus ex, ac gravida erat tempus id.`,
      '', '', '',
      `Fusce tempus velit eu lacus imperdiet, fringilla euismod lacus rutrum. Phasellus faucibus, augue et iaculis luctus, turpis metus mollis risus, eget dignissim enim lorem nec turpis. Suspendisse dictum ornare volutpat. Aenean ultricies dolor a ligula dictum, in viverra dui mollis. In sit amet dictum lacus, sed ullamcorper lacus. Praesent ac tortor at metus fringilla tempus quis non elit. Sed at quam volutpat sem cursus mollis non quis neque. Nullam pharetra turpis nec dictum molestie. In hac habitasse platea dictumst. Suspendisse nec tristique felis. Ut efficitur augue dui, eu imperdiet lectus elementum semper. Cras ut sagittis ante. Etiam dictum enim in lacinia mattis. Nunc eu interdum lorem. Nulla a nisi tincidunt, auctor metus at, ornare massa. Etiam eu placerat leo.`,
      '', '', '', 
      `Nulla nec erat tempus orci lobortis dapibus quis ac risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Ut tempor tellus a odio posuere faucibus eu sed leo. Praesent quis risus eu nunc ultrices vehicula sed a sapien. Suspendisse nec dolor pellentesque, convallis est id, fermentum velit. Proin iaculis porta diam nec ornare. Vestibulum convallis vitae augue vitae molestie. Morbi augue velit, rutrum porta malesuada vitae, egestas id ex. Proin rhoncus ligula at magna fermentum varius. Sed ante magna, mattis lacinia erat nec, vestibulum semper felis. Donec at tempor libero, et porttitor mi. Sed quis lacus malesuada, gravida urna nec, fringilla mi. [[User:Newuser5|Newuser5]] ([[User talk:Newuser5|talk]]) 08:20, 25 October 2025 (UTC)`
    ],
    timestamp: Date.parse('2025-10-25T08:20:29Z'),
    isReply: false,
    fromRev: 0, 
    toRev: 7,
    isNewPage: true,
    hasMultipleRevs: false
  },
  {
    author: '127.0.0.1',
    pageTitle: 'Page 6',
    heading: 'I am a post added by an anonymous editor',
    textAdditions: [
      `== I am a post added by an anonymous editor ==`,
      '', '', '',
      `lorem ipsum dolor sit amet... is how the lore goes. [[Special:Contributions/127.0.0.1|127.0.0.1]] 06:59, 25 October 2025 (UTC)`
    ],
    timestamp: Date.parse('2025-10-25T06:59:15Z'),
    isReply: false,
    fromRev: 0, 
    toRev: 8,
    isNewPage: true,
    hasMultipleRevs: false
  },
  {
    author: 'NewUser6',
    pageTitle: 'Page 7',
    heading: 'I am a comment with certain special characters [ & > < \' " ]',
    textAdditions: [
      `== I am a comment with certain special characters [ & > < ' " ] ==`,
      '', '', '',
      `I contain several characters that should be encoded when sending this message in XML format. [ & > < ' " ]. [[User:Newuser6|Newuser6]] ([[User talk:Newuser6|talk]]) 03:10, 25 October 2025 (UTC)`
    ],
    timestamp: Date.parse('2025-10-25T03:10:55Z'),
    isReply: false,
    fromRev: 0, 
    toRev: 9,
    isNewPage: true,
    hasMultipleRevs: false
  },
  {
    author: 'NewUser6',
    pageTitle: 'Page 1',
    heading: 'I am a comment with certain special characters [ & > < \' " ]',
    textAdditions: [
      '',
      '== I am a comment with certain special characters [ & > < \' " ] ==',
      '',
      'I contain several characters that should be encoded when sending this message in XML format. [ & > < \' " ]. [[User:Newuser6|Newuser6]] ([[User talk:Newuser6|talk]]) 03:09, 25 October 2025 (UTC)'
    ],
    timestamp: Date.parse('2025-10-25T03:09:49Z'),
    isReply: false,
    fromRev: 2, 
    toRev: 10,
    isNewPage: false,
    hasMultipleRevs: false
  }
];
export const expectedParsedApiRcs: IParsedApiQueryRc[] = [
  {
    pageId: 1,
    pageTitle: 'Page 1',
    heading: 'I am a new comment on an existing page!',
    username: 'NewUser1',
    isAnon: false,
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
    isAnon: false,
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
    isAnon: false,
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
    isAnon: false,
    timestamp: Date.parse('2025-10-25T08:23:01Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 6,
    contents: null
  },
  {
    pageId: 5,
    pageTitle: 'Page 5',
    heading: 'I am a long comment',
    username: 'NewUser5',
    isAnon: false,
    timestamp: Date.parse('2025-10-25T08:20:29Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 7,
    contents: null
  },
  {
    pageId: 6,
    pageTitle: 'Page 6',
    heading: 'I am a post added by an anonymous editor',
    username: '127.0.0.1',
    isAnon: true,
    timestamp: Date.parse('2025-10-25T06:59:15Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 8,
    contents: null
  },
  {
    pageId: 7,
    pageTitle: 'Page 7',
    heading: 'I am a comment with certain special characters [ & > < \' " ]',
    username: 'NewUser6',
    isAnon: false,
    timestamp: Date.parse('2025-10-25T03:10:55Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 9,
    contents: null
  },
  {
    pageId: 1,
    pageTitle: 'Page 1',
    heading: 'I am a comment with certain special characters [ & > < \' " ]',
    username: 'NewUser6',
    isAnon: false,
    timestamp: Date.parse('2025-10-25T03:09:49Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 2,
    toRev: 10,
    contents: null
  }
];
export const expectedCombinedOutput: IParsedApiQueryRc[] = [
  {
    pageId: 1,
    pageTitle: 'Page 1',
    heading: 'I am a new comment on an existing page!',
    username: 'NewUser1',
    isAnon: false,
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
    isAnon: false,
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
    isAnon: false,
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
    isAnon: false,
    timestamp: Date.parse('2025-10-25T08:23:01Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 6,
    contents: `I am a comment without a topic sad emoji`
  },
  {
    pageId: 5,
    pageTitle: 'Page 5',
    heading: 'I am a long comment',
    username: 'NewUser5',
    isAnon: false,
    timestamp: Date.parse('2025-10-25T08:20:29Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 7,
    contents: `${
      ''
    }Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vulputate felis vel aliquam facilisis. Fusce consectetur eros ex, sed rutrum quam dapibus in. Ut bibendum justo sit amet magna hendrerit, sed consequat dolor porta. Vestibulum rhoncus nibh id risus semper, eu ultricies mi consequat. Mauris et placerat libero. Curabitur pulvinar ac enim et maximus. Curabitur luctus lobortis est, nec ornare enim maximus eget.${
      ' '
    }Quisque dictum consequat metus in suscipit. Ut gravida risus tortor, vitae vulputate ex pretium eu. Aliquam maximus nunc sed lacus ultricies interdum. Suspendisse non dui non lorem consequat faucibus eu et sem. Pellentesque pretium leo quis tincidunt ullamcorper. Phasellus ac tempor enim. Mauris ullamcorper non ex ac molestie. Cras non sapien eu ipsum porttitor sagittis eu in orci. Fusce scelerisque aliquet elit ut dignissim. Sed bibendum dapibus tortor, eget vulputate dui lobortis quis. Morbi a scelerisque lacus, vitae pellentesque sapien. Sed arcu libero, fermentum quis tortor sit amet, venenatis lacinia nunc. Duis sit amet arcu neque. Ut finibus posuere scelerisque. In quis auctor metus, sed egestas libero.${
      ' '
    }Nulla quis dui risus. Donec et lacinia magna. Fusce mattis sapien et mi blandit cursus. Mauris varius, nibh congue iaculis commodo, libero enim convallis ligula, in semper sem nunc vitae ligula. Vestibulum et urna ligula. Mauris dictum metus ac quam efficitur aliquet. Mauris pharetra finibus ex, ac gravida erat tempus id.${
      ' '
    }Fusce tempus velit eu lacus imperdiet, fringilla euismod lacus rutrum. Phasellus faucibus, augue et iaculis luctus, turpis metus mollis risus, eget dignissim enim lorem nec turpis. Suspendisse dictum ornare volutpat. Aenean ultricies dolor a ligula dictum, in viverra dui mollis. In sit amet dictum lacus, sed ullamcorper lacus. Praesent ac tortor at metus fringilla tempus quis non elit. Sed at quam volutpat sem cursus mollis non quis neque. Nullam pharetra turpis nec dictum molestie. In hac habitasse platea dictumst. Suspendisse nec tristique felis. Ut efficitur augue dui, eu imperdiet lectus elementum semper. Cras ut sagittis ante. Etiam dictum enim in lacinia mattis. Nunc eu interdum lorem. Nulla a nisi tincidunt, auctor metus at, ornare massa. Etiam eu placerat leo.${
      ' '
    }Nulla nec erat tempus orci lobortis dapibus quis ac risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Ut tempor tellus a odio posuere faucibus eu sed leo. Praesent quis risus eu nunc ultrices vehicula sed a sapien. Suspendisse nec dolor pellentesque, convallis est id, fermentum velit. Proin iaculis porta diam nec ornare. Vestibulum convallis vitae augue vitae molestie. Morbi augue velit, rutrum porta malesuada vitae, egestas id ex. Proin rhoncus ligula at magna fermentum varius. Sed ante magna, mattis lacinia erat nec, vestibulum semper felis. Donec at tempor libero, et porttitor mi. Sed quis lacus malesuada, gravida urna nec, fringilla mi.`
  },
  {
    pageId: 6,
    pageTitle: 'Page 6',
    heading: 'I am a post added by an anonymous editor',
    username: '127.0.0.1',
    isAnon: true,
    timestamp: Date.parse('2025-10-25T06:59:15Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 8,
    contents: `lorem ipsum dolor sit amet... is how the lore goes.`
  },
  {
    pageId: 7,
    pageTitle: 'Page 7',
    heading: 'I am a comment with certain special characters [ & > < \' " ]',
    username: 'NewUser6',
    isAnon: false,
    timestamp: Date.parse('2025-10-25T03:10:55Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 0,
    toRev: 9,
    contents: `I contain several characters that should be encoded when sending this message in XML format. [ & > < \' " ].`
  },
  {
    pageId: 1,
    pageTitle: 'Page 1',
    heading: 'I am a comment with certain special characters [ & > < \' " ]',
    username: 'NewUser6',
    isAnon: false,
    timestamp: Date.parse('2025-10-25T03:09:49Z'),
    isReply: false,
    isNewTopic: true,
    fromRev: 2,
    toRev: 10,
    contents: `I contain several characters that should be encoded when sending this message in XML format. [ & > < \' " ].`
  }
];
