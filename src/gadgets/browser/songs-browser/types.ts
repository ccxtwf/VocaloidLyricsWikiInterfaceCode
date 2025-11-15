import { ApiResponse } from "types-mediawiki/mw/Api.js"

export interface ISongBrowserDropdownOption {
  name: string
  cats: {
    title: string
    event: string
  }[]
  setupHooksOnCategoryFetch: () => void
  toggleElementsOnMainArticle: (show: boolean) => void
}

export interface ILookForCategories {
  titles: string[],
  fetched: {
    [title: string]: boolean
  },
  mapToEvents: {
    [title: string]: string
  },
  mapToResults: {
    [title: string]: string[]
  }
}

export interface IApiSettings {
  serverCacheMaxAge: number
	apiMaxLimit: number
}

interface IBasicFetchUtils {
  api: mw.Api
	lookForCategories: ILookForCategories
	apiSettings: IApiSettings
  registerCategory: (title: string, event: string) => void
  createQueryPromises: (categories: string[]) => [mw.Api.AbortablePromise[], string[][]]
  processSettledPromise: (results: PromiseSettledResult<ApiResponse>, categories: string[]) => void
  publishResultsToObserver: (category: string) => void
  queryPagesBelongingToUnfetchedCategories: () => void
}

export interface IAlbumFetchUtils extends IBasicFetchUtils {
  checkForAlbumTitles: string[]
  findAlbumSongTitles: () => string[]
}

export interface ICategoryFetchUtils extends IBasicFetchUtils {
  categorySettings: {
    categoryId: number
    contentLanguage: string
    from?: string | null
    to?: string | null
    curPagesInCategory: number
    totalPagesInCategory: number
  }
}

export interface IExpectedApiQueryAlbum extends ApiResponse {
  batchcomplete: string
  continue?: {
    continue: string
    clcontinue: string
  }
  error?: {
    info: string
  } | string
  query: {
    pages: {
      [pageid: string]: {
        categories?: {
          ns: number
          title: string
        }[]
        ns: number
        pageid: number
        title: string
      }
    }
    redirects?: {
      from: string
      to: string
    }[]
  }
}

export interface IExpectedApiQueryCategory extends ApiResponse {
  batchcomplete: string
  continue?: {
    continue: string
    gcmcontinue: string
  }
  error?: {
    info: string
  } | string
  query: {
    pages: {
      [pageid: string]: {
        categories?: {
          ns: number
          title: string
        }[]
        ns: number
        pageid: number
        title: string
      }
    }
  }
}