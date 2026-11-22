import { translate } from "../i18n";
import {
  pasteContextMenuItem,
  boldContextMenuItem,
  italicizeContextMenuItem,
  unboldContextMenuItem,
  unitalicizeContextMenuItem,
  insertMultipleRowsMenuItem,
} from "./factory";

export interface InitCustomContextMenu {
  resetTable: () => void;
}

export const getLyricsContextMenu = ({ resetTable }: InitCustomContextMenu) => ({
  items: {
    copy: { disabled: false },
    cut: { disabled: false },
    paste: pasteContextMenuItem({ name: translate("handsontable.paste") }),
    sp1: "---------",
    undo: { disabled: false },
    redo: { disabled: false },
    sp2: "---------",
    bold: boldContextMenuItem({ name: translate("handsontable.bold") }),
    italic: italicizeContextMenuItem({ name: translate("handsontable.italic") }),
    unbold: unboldContextMenuItem({ name: translate("handsontable.unbold") }),
    unitalic: unitalicizeContextMenuItem({ name: translate("handsontable.unitalic") }),
    sp3: "---------",
    row_above: { disabled: false },
    row_below: { disabled: false },
    insert_n_rows: insertMultipleRowsMenuItem(),
    remove_row: { disabled: false },
    clear_column: { disabled: false },
    sp4: "---------",
    reset_table: {
      name: translate("handsontable.reset"),
      hidden: false,
      callback: resetTable,
    },
  },
});