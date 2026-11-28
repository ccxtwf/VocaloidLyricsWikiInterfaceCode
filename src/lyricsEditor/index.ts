import * as handsontable from "./handsontable";
import { extractLyricsTablesFromWikipageSrc, parseLyrics } from "./utils/parseLyrics";
import {
  determineColumnHeaders,
  addColumnsAtIndexToTheLeftToToggle,
  addColumnsAtIndexToTheRightToToggle,
  removeColumnsAtIndexFromToggle,
} from "./utils/lyricsUtils";
import { buildNewLyricsSegment } from "./utils/buildNewLyrics";
import "./index.less";

export default {
  handsontable,
  utils: {
    extractLyricsTablesFromWikipageSrc,
    parseLyrics,
    buildNewLyricsSegment,
    determineColumnHeaders,
    addColumnsAtIndexToTheLeftToToggle,
    addColumnsAtIndexToTheRightToToggle,
    removeColumnsAtIndexFromToggle,
  },
};