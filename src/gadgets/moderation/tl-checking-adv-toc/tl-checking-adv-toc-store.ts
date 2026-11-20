import type { defineStore } from "pinia";
import type { UseAppPiniaStoreType } from "./types.ts";

const Pinia = mw_require("pinia");
import type { IAppStore, TlCheckingParsedQueueItem, TlCheckingTocItemGroup } from "./types.ts";

function qualifyTlItemBySource(
  { isThirdParty, isOfficial }: TlCheckingParsedQueueItem,
  sourceMode: number,
) {
  if (sourceMode < 1) {
    return true; // show all items
  }
  return sourceMode < 3 ? (isThirdParty ? 2 : 1) === sourceMode : isOfficial;
}

function qualifyTlItemByStatus({ outcome }: TlCheckingParsedQueueItem, statusMode: number) {
  switch (statusMode) {
    case 1:
      return Boolean(outcome); // checked
    case 2:
      return !outcome; // unchecked
  }
  return true; // show all items
}

const useTlQueueStore: UseAppPiniaStoreType = (Pinia.defineStore as typeof defineStore)(
  "tlQueueAdvTocStore",
  {
    state: (): IAppStore => ({
      items: {} as Record<string, TlCheckingParsedQueueItem[]>,
      sourceMode: 0,
      statusMode: 0,
      isLoading: false,
      isError: false,
    }),
    actions: {
      setItems(
        firstPartyList: TlCheckingParsedQueueItem[],
        thirdPartyList: TlCheckingParsedQueueItem[],
      ) {
        this.items = [...firstPartyList, ...thirdPartyList].reduce(
          (res, item) => {
            const key = `${item.originalTitle.toLocaleLowerCase()}_${item.songAuthor.toLocaleLowerCase()}`;
            if (!res[key]) {
              res[key] = [];
            }
            res[key].push(item);
            return res;
          },
          {} as Record<string, TlCheckingParsedQueueItem[]>,
        );
      },
      setIsLoading(isLoading: boolean) {
        this.isLoading = isLoading;
      },
      setIsError(isError: boolean) {
        this.isError = isError;
      },
    },
    getters: {
      shown(state: IAppStore) {
        const res: TlCheckingTocItemGroup[] = [];
        for (const rGroup of Object.values(state.items)) {
          const cGroup: TlCheckingTocItemGroup = {
            originalTitle: rGroup[0].originalTitle,
            songAuthor: rGroup[0].songAuthor,
            subitems: [],
          };
          for (const item of rGroup) {
            if (
              !qualifyTlItemBySource(item, this.sourceMode) ||
              !qualifyTlItemByStatus(item, this.statusMode)
            ) {
              continue;
            }
            cGroup.subitems.push(item);
          }
          if (cGroup.subitems.length) res.push(cGroup);
        }
        return res;
      },
    },
  },
);

module.exports = useTlQueueStore;