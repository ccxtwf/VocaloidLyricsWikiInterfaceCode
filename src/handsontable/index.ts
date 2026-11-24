import "./registration";
import Handsontable from "handsontable/base";
import { getLyricsEditContextMenu as getContextMenu } from "./contextMenus/lyricsEdit";
import { getRenderer } from "handsontable/renderers";
import { getTheme } from "handsontable/themes";

export default {
  Handsontable,
  getContextMenu,
  getRenderer,
  getTheme,
};