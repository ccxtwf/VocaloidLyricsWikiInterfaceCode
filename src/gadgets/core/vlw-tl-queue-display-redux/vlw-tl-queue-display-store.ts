import type { defineStore } from "pinia";
import type { UseAppPiniaStoreType } from "./types.ts";

const Pinia = mw_require("pinia");
import type { IAppStore, TLQueueCollection } from "./types.ts";

const useTlQueueStore: UseAppPiniaStoreType = (Pinia.defineStore as typeof defineStore)(
  "tlQueueSidebarState",
  {
    state(): IAppStore {
      return {
        firstParty: {
          isLoading: false,
          isError: false,
          data: null,
        },
        thirdParty: {
          isLoading: false,
          isError: false,
          data: null,
        },
        isExpanded: 0,
      };
    },
    actions: {
      setAllItems(firstPartyList: TLQueueCollection, thirdPartyList: TLQueueCollection) {
        this.firstParty.data = firstPartyList;
        this.thirdParty.data = thirdPartyList;
      },
      setItems(isThirdParty: boolean, data: TLQueueCollection) {
        this[isThirdParty ? "thirdParty" : "firstParty"].data = data;
      },
      setIsLoading(isThirdParty: boolean, isLoading: boolean) {
        this[isThirdParty ? "thirdParty" : "firstParty"].isLoading = isLoading;
      },
      setIsError(isThirdParty: boolean, isError: boolean) {
        this[isThirdParty ? "thirdParty" : "firstParty"].isError = isError;
      },
      setIsExpanded(x: number) {
        this.isExpanded = x;
      },
    },
  },
);

export default useTlQueueStore;