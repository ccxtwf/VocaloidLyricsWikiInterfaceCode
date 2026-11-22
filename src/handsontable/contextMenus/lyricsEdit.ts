import type { HotInstance } from "handsontable/base";
import { getLyricsContextMenu, type InitCustomContextMenu } from "./lyrics";

export const getLyricsEditContextMenu = (args: InitCustomContextMenu) => ({
  items: {
    ...getLyricsContextMenu(args).items,
    sp5: "---------",
    ["col_left"]: {
      disabled(this: HotInstance) {
        const rng = this.getSelectedRange()!;
        if (rng.length > 1) {
          return true;
        }
        const {
          from: { col: fromCol },
          to: { col: toCol },
        } = rng[0];
        // Cannot add column to the left if:
        //  1) The current position is the "customStyle" column
        //  2) More than one column is selected
        //  3) The max column size is reached
        return (
          fromCol === 0 ||
          toCol! - fromCol! > 0 ||
          this.countCols() >= (this.getSettings().maxCols as number)
        );
      },
      callback(this: HotInstance) {
        let {
          from: { col: fromCol },
        } = this.getSelectedRange()![0];
        // Cannot insert column to the left of the first column
        fromCol = Math.max(fromCol!, 1);
        DEBUG && console.log("INSERT LEFT", fromCol!);
        this.alter("insert_col_start", fromCol!, 1);
      },
    },
    ["col_right"]: {
      disabled(this: HotInstance) {
        const rng = this.getSelectedRange()!;
        if (rng.length > 1) {
          return true;
        }
        const {
          from: { col: fromCol },
          to: { col: toCol },
        } = rng[0];
        // Cannot add column to the right if:
        //  1) More than one column is selected
        //  2) The max column size is reached
        return toCol! - fromCol! > 0 || this.countCols() >= (this.getSettings().maxCols as number);
      },
      callback(this: HotInstance) {
        const {
          to: { col: toCol },
        } = this.getSelectedRange()![0];
        DEBUG && console.log("INSERT RIGHT", toCol!);
        this.alter("insert_col_end", toCol!, 1);
      },
    },
    ["remove_col"]: {
      disabled(this: HotInstance) {
        // Cannot remove column if the cursor is at the first (`customStyle`) column
        for (let {
          from: { col: fromCol },
          to: { col: toCol },
        } of this.getSelectedRange() || []) {
          if (fromCol! > toCol!) {
            [fromCol, toCol] = [toCol!, fromCol!];
          }
          if (fromCol === 0) {
            return true;
          }
        }
        return false;
      },
    },
  },
});