export interface IMenuUption {
	label: string					// Dropdown menu item label
	frc: string						// Query parameter to pass onto the Action API (action=recentchanges)
	ns: number[] |null		// List of namespace IDs 
}

export interface IParsedRssRcFeed { 
	author: string
	pageTitle: string 
	heading: string | null
	textAdditions: string[] | null
	timestamp: number | null
	isReply: boolean
	fromRev: number 
	toRev: number
	isNewPage: boolean
	hasMultipleRevs: boolean
}

export interface IParsedApiQueryRc {
	pageId: number
	pageTitle: string
	heading: string | null
	username: string
	isAnon: boolean
	timestamp: number | null
	isReply: boolean
	isNewTopic: boolean
	fromRev: number
	toRev: number
	contents: string | null
}

export interface IGroupedParsedApiQueryRc { 
	[d: string]: IParsedApiQueryRc[] 
}

interface IApiResponse {
	batchcomplete: string
	continue?: {
		rccontinue?: string
		continue?: string
	}
	query?: any
}

export interface IExpectedApiQueryRcResponse extends IApiResponse {
	query: {
		recentchanges?: {
			type: string
			ns: number
			title: string
			pageid: number
			revid: number
    	old_revid: number
      rcid: number
      user: string
			anon?: ''
      timestamp: string
      comment: string
      tags: string[]
		}[]
	}
}

export interface IExpectedApiQueryRvResponse extends IApiResponse {
	query: {
		pages?: {
			[pageid: string]: {
				pageid: number
				ns: number
				title: string
				revisions: {
					revid: number
					parentid: number
					user: string
					timestamp: string
					diff: {
						from: number
						to: number
						'*': string
					}
					comment: string
				}[]
			}
		}
	}
}

export interface IAppStore {
	option: number
	data: IGroupedParsedApiQueryRc
	isLoading: boolean
}