import {
  registerCellType,
  NumericCellType,
  DropdownCellType,
  TextCellType,
  CheckboxCellType,
} from "handsontable/cellTypes";
import {
  registerPlugin,
  CopyPaste,
  AutoColumnSize,
  ContextMenu,
  UndoRedo,
  ManualColumnResize,
  StretchColumns,
  HiddenColumns,
  Autofill,
} from "handsontable/plugins";
import { registerRenderer } from "handsontable/renderers";
import { registerTheme, mainTheme } from "handsontable/themes";
import { registerLanguageDictionary, enUS } from "handsontable/i18n";

import { customStyleRenderer, lyricsRenderer } from "./renderers/lyrics";

registerCellType(TextCellType);
registerCellType(NumericCellType);
registerCellType(DropdownCellType);
registerCellType(CheckboxCellType);

registerPlugin(CopyPaste);
registerPlugin(AutoColumnSize);
registerPlugin(ContextMenu);
registerPlugin(UndoRedo);
registerPlugin(ManualColumnResize);
registerPlugin(StretchColumns);
registerPlugin(HiddenColumns);
registerPlugin(Autofill);

registerTheme("auto", mainTheme).setColorScheme("auto").setDensityType("compact");
registerTheme("light", mainTheme).setColorScheme("light").setDensityType("compact");
registerTheme("dark", mainTheme).setColorScheme("dark").setDensityType("compact");

registerRenderer("lyrics-custom-style", customStyleRenderer);
registerRenderer("lyrics", lyricsRenderer);

registerLanguageDictionary(enUS);