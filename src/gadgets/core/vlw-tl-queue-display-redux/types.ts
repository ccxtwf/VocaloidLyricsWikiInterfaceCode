import type { Store, StoreDefinition } from "pinia";
export type { TlCheckingParsedQueueItem } from "../../../utils/tl-checking-utils.ts";
import type { TlCheckingParsedQueueItem } from "../../../utils/tl-checking-utils.ts";

export interface TLQueueCollection {
  onq: TlCheckingParsedQueueItem[];
  res: TlCheckingParsedQueueItem[];
}

export interface TLQueueStore {
  isLoading: boolean;
  isError: boolean;
  data: TLQueueCollection | null;
}

export interface IAppStore {
  firstParty: TLQueueStore;
  thirdParty: TLQueueStore;
  isExpanded: number;
}

type AppPiniaId = "tlQueueSidebarState";
interface AppPiniaGetters {}
interface AppPiniaMethods {
  setAllItems: (firstPartyList: TLQueueCollection, thirdPartyList: TLQueueCollection) => void;
  setItems: (isThirdParty: boolean, data: TLQueueCollection) => void;
  setIsLoading: (isThirdParty: boolean, isLoading: boolean) => void;
  setIsError: (isThirdParty: boolean, isError: boolean) => void;
  setIsExpanded: (x: number) => void;
}

export type UseAppPiniaStoreType = StoreDefinition<
  AppPiniaId,
  IAppStore,
  AppPiniaGetters,
  AppPiniaMethods
>;

export type AppPiniaStore = Store<AppPiniaId, IAppStore, AppPiniaGetters, AppPiniaMethods>;

export interface TlAppProps {
  onRefresh: () => void;
}

export interface TlQueueSectionsProps {
  headingMessageName: string;
  linkToPage: string;
  storeKey: keyof Pick<IAppStore, "firstParty" | "thirdParty">;
  exI: number;
}

export interface TlQueueSectionProps extends Pick<
  TlQueueSectionsProps,
  "headingMessageName" | "exI"
> {
  store: TlCheckingParsedQueueItem[];
  doNotShowLoadMore?: boolean;
}