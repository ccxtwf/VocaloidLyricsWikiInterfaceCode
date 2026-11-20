import type { Store, StoreDefinition } from "pinia";
import type { TlCheckingParsedQueueItem } from "../../../utils/tl-checking-utils";
export type { OutcomeEnum, TlCheckingParsedQueueItem } from "../../../utils/tl-checking-utils";

export interface IAppStore {
  items: Record<string, TlCheckingParsedQueueItem[]>;
  sourceMode: number;
  statusMode: number;
  isLoading: boolean;
  isError: boolean;
}

type AppPiniaId = "tlQueueAdvTocStore";
interface AppPiniaGetters {
  shown: (state: IAppStore) => TlCheckingTocItemGroup[];
}
interface AppPiniaMethods {
  // setSourceFilter: (filter: number) => void;
  // setStatusFilter: (filter: number) => void;
  setItems: (
    firstPartyList: TlCheckingParsedQueueItem[],
    thirdPartyList: TlCheckingParsedQueueItem[],
  ) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsError: (isError: boolean) => void;
}

export type UseAppPiniaStoreType = StoreDefinition<
  AppPiniaId,
  IAppStore,
  AppPiniaGetters,
  AppPiniaMethods
>;

export type AppPiniaStore = Store<AppPiniaId, IAppStore, AppPiniaGetters, AppPiniaMethods>;

export interface TlCheckingTocItemGroup extends Pick<
  TlCheckingParsedQueueItem,
  "originalTitle" | "songAuthor"
> {
  subitems: TlCheckingParsedQueueItem[];
}