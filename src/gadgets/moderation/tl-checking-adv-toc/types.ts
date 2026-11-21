import type { Store, StoreDefinition } from "pinia";
import type { TlCheckingParsedQueueItem } from "../../../utils/tl-checking-utils";
export type { OutcomeEnum, TlCheckingParsedQueueItem } from "../../../utils/tl-checking-utils";

export type OnPageEnum =
  | /* Null state */ null
  | /* First-party page */ 0
  | /* Third-party page */ 1;
export type SourceModeEnum =
  | /* Select all sources */ 0
  | /* First-party tls */ 1
  | /* Third-party tls */ 2
  | /* Official tls */ 3;
export type StatusModeEnum = /* Select all */ 0 | /* Checked tls */ 1 | /* Unchecked tls */ 2;

export interface IAppStore {
  items: Record<string, TlCheckingParsedQueueItem[]>;
  sourceMode: SourceModeEnum;
  statusMode: StatusModeEnum;
  isLoading: boolean;
  isError: boolean;
}

type AppPiniaId = "tlQueueAdvTocStore";
interface AppPiniaGetters {
  shown: (state: IAppStore) => TlCheckingTocItemGroup[];
}
interface AppPiniaMethods {
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