import { 
  getWikipageTables,
  parseLyrics,
  buildLyricsTable,
  rxMatchBoldedCss,
  rxMatchBolded,
  rxMatchItalicisedCss,
  rxMatchItalicised,
} from "./utils.js";
import { Core, GridSettings, CellSelection, ContextMenuCallback, ContextMenuSettings } from "./hottable.js";

'use strict';

(function (mw, $) {
  // Only on desktop
  if (((window.screen || {}).width || window.innerWidth) < 500 || ((window.screen || {}).height || window.innerHeight) < 500) { 
    return;
  }

  // Only load once
  if ($('#ca-edit-lyrics').length > 0) { 
    return;
  }

  const DEBUGGING_ID = "vlw-lyrics-editor";

  const messages = {
    'vlw-lyrics-editor--menu-prompt': 'Edit Lyrics Table',
    'vlw-lyrics-editor--menu-tooltip': 'Use a script to edit the lyrics more easily.',
    'vlw-lyrics-editor--now-loading': 'Now loading...',
    'vlw-lyrics-editor--found-n-tables': 'Found $1 table(s)',
    'vlw-lyrics-editor--no-table-found': 'Found $1 table(s)',
    'vlw-lyrics-editor--ith-table': 'Table #$1',
    'vlw-lyrics-editor--confirm-button-text': 'Replace Lyrics Table',
    'vlw-lyrics-editor--confirm-buttom-tooltip': 'Replace the lyrics table wikicode',
    'vlw-lyrics-editor--success': 'Successfully replaced lyrics!',
    'vlw-lyrics-editor--failed-to-paste': "Unable to paste! Please use keyboard command (Ctrl/Cmd + V)!",
    'vlw-lyrics-editor--report-message': 'You can report any bugs to [[MediaWiki talk:Gadget-lyrics-editor]] or to [[User talk:CoolMikeHatsune22|the script developer\'s user talk page.]]'
  };
  mw.messages.set(messages);

  // =================
  //   Configuration
  // =================
  const config = mw.config.get([
    'wgAction',
    'skin'
  ]);
  const MAX_HOTTABLE_COLUMNS = 5 + 1;  // Max 5 columns per table
  const EDITOR_TEXTAREA_SELECTOR = '#wpTextbox1';
  let $list: JQuery<HTMLElement> | null = null, 
      $a: JQuery<HTMLElement>, 
      $modal: JQuery<HTMLElement>, 
      $modalContent: JQuery<HTMLElement>, 
      $hotTable: Core;

  // =================
  //   HotTable Dependency 
  // =================
  function getSelectedRowData(instance: Core): any[][] {
    const data = instance.getSelectedRange();
    if (!data || data.length === 0) {
      return [];
    }
    const {
      from: { row: fromRow } = {},
      to: { row: toRow } = {}
    } = data[0];
    const selectedRows: any[][] = [];
    for (let i = fromRow!; i <= toRow!; i++) {
      selectedRows.push(instance.getDataAtRow(i)!);
    }
    return selectedRows;
  }

  function resetColumnHeaders(numColumns: number): void {
    const columnHeaders = ['Row style'];
    const columnWidths = [160];
    for (let i = 0; i < numColumns; i++) {
      columnHeaders.push("Column " + (i+1));
      columnWidths.push(250);
    }
    $hotTable.updateSettings({
      colHeaders: columnHeaders,
      colWidths: columnWidths,
    });
  }

  function _cbHottableOnPaste(_: string, selection: CellSelection[], __: MouseEvent): void {
    if (!selection || selection.length === 0) {
      return;
    }
    const { 
      start: { row: fromRow, col: fromCol } = {}, 
      end: { row: toRow, col: toCol } = {} 
    } = selection[0];
    navigator.clipboard.readText()
      .then(function (str) {
        const pasted = str.split(/\n/).map((line) => line.split(/\t/));
        const numExistingRows = (this as Core).getData().length;
        const numOverlappedExistingRows = Math.min(
          numExistingRows - fromRow!,
          pasted.length
        );
        const numOverflowedRows = pasted.length - numOverlappedExistingRows;
        let numPastedColumns = 0;
        for (let i = 0; i < pasted.length; i++) {
          numPastedColumns = Math.max(numPastedColumns, pasted[i].length);
        }
        const changes: [number, number, any][] = [];
            
        if (fromRow === toRow && fromCol === toCol) {
          // Starting cell is a single cell
          // In this case, limit the paste range to rows after fromRow and columns after fromCol
          const numOverlappedExistingColumns = Math.min((this as Core).countCols(), numPastedColumns);
          for (let i = 0; i < numOverlappedExistingRows; i++) {
            for (let j = 0; j < numOverlappedExistingColumns; j++) {
              changes.push([fromRow!+i, j, pasted[i][j] || '']);
            }
          }
          for (let i = 0; i < numOverflowedRows; i++) {
            for (let j = 0; j < numOverlappedExistingColumns; j++) {
              changes.push([numExistingRows+i, j, pasted[numOverlappedExistingRows+i][j] || '']);
            }
          }
        } else {
          // Starting cell is a multi-cell range
          // In this case, limit the paste range to the columns within fromCol & toCol, 
          // and to rows below (equal to or more than) fromRow
          for (let i = 0; i < numOverlappedExistingRows; i++) {
            for (let j = fromCol!; j <= toCol!; j++) {
              changes.push([fromRow!+i, j, pasted[i][j-fromCol!] || '']);
            }
          }
          for (let i = 0; i < numOverflowedRows; i++) {
            for (let j = fromCol!; j <= toCol!; j++) {
              changes.push([numExistingRows+i, j, pasted[numOverlappedExistingRows+i][j-fromCol!] || '']);
            }
          }
        }
            
        (this as Core).setDataAtCell(changes);
      })
      .catch(function (error) {
        console.error(error, DEBUGGING_ID);
        window.alert(mw.msg('vlw-lyrics-editor--failed-to-paste'));
      });
  }

  // Criteria for unbold/unitalicize: At least one row must be styled
  // Criteria for bold/italicize: Every row must not be styled
  // Return the boolean value to set whether the option should be hidden
  function _cbHottableCheckForStyleInSelection(rowInlineCss: RegExp, cellWikitextMarkup: RegExp, modeRemoveStyle: boolean): ContextMenuCallback {
    return function(): boolean {
      const selectedRows = getSelectedRowData((this as Core));
      let res: boolean;
      if (modeRemoveStyle) {
        res = selectedRows.some(function (row) {
          if ((row[0] || '').match(rowInlineCss) !== null) {
            return true;
          } 
          for (let i = 1; i < row.length; i++) {
            if ((row[i] || '').trim() !== '' && row[i].match(cellWikitextMarkup) !== null) {
              return true;
            } 
          }
          return false;
        });
      } else {
        res = selectedRows.every(function (row) {
          if ((row[0] || '').match(rowInlineCss) !== null) {
            return false;
          } 
          for (let i = 1; i < row.length; i++) {
            if ((row[i] || '').trim() !== '' && row[i].match(cellWikitextMarkup) !== null) {
              return false;
            } 
          }
          return true;
        });
      }
      return !res;
    };
  }

  function _cbHottableAddStyle(customStyle: string): ContextMenuCallback {
    return function (_, selection, __): void {
      if (!selection || selection.length === 0) {
        return;
      }
      const {
        start: { row: fromRow } = {},
        end: { row: toRow } = {}
      } = selection[0];
      const data = (this as Core).getData();
      for (let i = fromRow!; i <= toRow!; i++) {
        if (!data[i][0]) data[i][0] = '';
        data[i][0] += customStyle;
      }
      (this as Core).loadData(data);
    };
  }

  function _cbHottableRemoveStyle(rowInlineCss: RegExp, cellWikitextMarkup: RegExp): ContextMenuCallback {
    return function (_, selection, __): void {
      if (!selection || selection.length === 0) {
        return;
      }
      const {
        start: { row: fromRow } = {},
        end: { row: toRow } = {}
      } = selection[0];
      const data = (this as Core).getData();
      for (let i = fromRow!; i <= toRow!; i++) {
        data[i][0] = (data[i][0] || '').replace(rowInlineCss, "");
        for (let j = 1; j < data[i].length; j++) {
          const m = ((data[i][j] || '') as string).match(cellWikitextMarkup);
          if (m !== null) {
            data[i][j] = m.groups!['text']!;
          }
        }
      }
      (this as Core).loadData(data);
    };
  }

  const contextMenu: ContextMenuSettings = {
    items: {
      copy: { disabled: false },
      cut: { disabled: false },
      paste: {
        name: 'Paste',
        callback: _cbHottableOnPaste,
      },
      sp1: '---------',
      undo: { disabled: false },
      redo: { disabled: false },
      sp2: '---------',
      bold: {
        name: 'Bold row',
        hidden: _cbHottableCheckForStyleInSelection(rxMatchBoldedCss, rxMatchBolded, false),
        callback: _cbHottableAddStyle("font-weight: bold;"),
      },
      italic: {
        name: 'Italicize row',
        hidden: _cbHottableCheckForStyleInSelection(rxMatchItalicisedCss, rxMatchItalicised, false),
        callback: _cbHottableAddStyle("font-style: italic;"),
      },
      unbold: {
        name: 'Unbold row',
        hidden: _cbHottableCheckForStyleInSelection(rxMatchBoldedCss, rxMatchBolded, true),
        callback: _cbHottableRemoveStyle(rxMatchBoldedCss, rxMatchBolded),
      },
      unitalic: {
        name: 'Unitalicize row',
        hidden: _cbHottableCheckForStyleInSelection(rxMatchItalicisedCss, rxMatchItalicised, true),
        callback: _cbHottableRemoveStyle(rxMatchItalicisedCss, rxMatchItalicised),
      },
      sp3: '---------',
      row_above: { disabled: false }, 
      row_below: { disabled: false }, 
      col_left: { 
        disabled: function () {
          if ((this as Core).countCols() >= MAX_HOTTABLE_COLUMNS) { return true; }
          const data = (this as Core).getSelectedRange();
          if (!data || data.length === 0) {
            return false;
          }
          const fromCol = data[0].from.col;
          return (fromCol === 0);
        },
        callback: function () {
          const data = (this as Core).getSelectedRange();
          if (!data || data.length === 0) {
            return;
          }
          const fromCol = data[0].from.col;
          (this as Core).alter('insert_col_start', fromCol);
          resetColumnHeaders((this as Core).countCols());
        }
      }, 
      col_right: { 
        disabled: function () {
          return ((this as Core).countCols() >= MAX_HOTTABLE_COLUMNS);
        },
        callback: function () {
          const data = (this as Core).getSelectedRange();
          if (!data || data.length === 0) {
            return;
          }
          const toCol = data[0].to.col;
          (this as Core).alter('insert_col_end', toCol);
          resetColumnHeaders((this as Core).countCols());
        } 
      }, 
      remove_row: { disabled: false },
      remove_col: { 
        disabled: function () {
          const data = (this as Core).getSelectedRange();
          if (!data || data.length === 0) {
            return;
          }
          const fromCol = data[0].from.col;
          return (fromCol === 0);
        },
        callback: function () {
          const data = (this as Core).getSelectedRange();
          if (!data || data.length === 0) {
            return;
          }
          const {
            from: { col: fromCol } = {},
            to: { col: toCol } = {}
          } = data[0];
          (this as Core).alter('remove_col', fromCol, toCol-fromCol!+1);
          resetColumnHeaders((this as Core).countCols());
        }
      },
      clear_column: { disabled: false }
    }
  };

  function clearHotTable(): void {
    if ($hotTable) {
    $hotTable.destroy();
    $('#lyrics-editor-jstable-container-wrapper').html('').append(
      $('<div>', { id: 'lyrics-editor-jstable-container' })
    );
  }
  }

  function resetColumnHeadersOnUndoRedo({ actionType }: { actionType: string }): void {
    if (actionType === 'insert_col' || actionType === 'remove_col') {
      resetColumnHeaders((this as Core).countCols());
    }
  }

  // =================
  //   Run on loaded modal
  // =================
  function replaceLyricsTable(tableRegexResults: RegExpMatchArray): void {
    const oldTable = tableRegexResults[0];
    const newTable = buildLyricsTable(tableRegexResults.groups!['header']!, $hotTable.getData());
    const oldWikitext = (''+$(EDITOR_TEXTAREA_SELECTOR).val() || '');
    const newWikitext = oldWikitext.replace(oldTable, newTable);
    $(EDITOR_TEXTAREA_SELECTOR).val(newWikitext);
  }

  function closeModal(): void {
    $modal.hide();
    clearHotTable();
    $modalContent.find('#lyrics-editor-table-selector').html('');
    $modalContent.find('#lyrics-editor-loader').show();
  }

  function loadLyricsData(tableRegexResults: RegExpMatchArray): void {
    const [lyrics, numColumns] = parseLyrics(tableRegexResults.groups!['body']!, MAX_HOTTABLE_COLUMNS-1);
    const gridSettings: GridSettings = {
      data: lyrics,
      rowHeaders: true,
      contextMenu: contextMenu,
      width: '100%',
      // height: '100%',
      autoWrapRow: true,
      autoWrapCol: true,
      licenseKey: 'non-commercial-and-evaluation'
    };
    //@ts-ignore
    $hotTable = new Handsontable(document.getElementById('lyrics-editor-jstable-container'), gridSettings);
    $hotTable.addHook('afterUndo', resetColumnHeadersOnUndoRedo);
    $hotTable.addHook('afterRedo', resetColumnHeadersOnUndoRedo);
    resetColumnHeaders(numColumns);
    $('#lyrics-editor-jstable-container').css('overflow-x', 'hidden');
    const confirmButton = new OO.ui.ButtonWidget( {
      label: mw.msg('vlw-lyrics-editor--confirm-button-text'),
      icon: 'check',
      title: mw.msg('vlw-lyrics-editor--confirm-buttom-tooltip')
    } );
    confirmButton.on('click', function () {
      replaceLyricsTable(tableRegexResults);
      closeModal();
      mw.notify( mw.msg('vlw-lyrics-editor--success') );
    });
    $('#lyrics-editor-jstable-container-wrapper').append(
      $('<div>', { id: "lyrics-editor-actions" }).append(confirmButton.$element)
    );
  }
    
  function loadModalUtilities () {
    const tables = getWikipageTables(''+($(EDITOR_TEXTAREA_SELECTOR).val() || ''));
    $modalContent = $('.lyrics-editor-modal-content');
    $modalContent.find('#lyrics-editor-loader').hide();
    if (tables.length) {
      $modalContent.find('#lyrics-editor-table-selector').html('')
        .append(
          $('<p>').text(
            mw.msg('vlw-lyrics-editor--found-n-tables', tables.length)
          )
        );
      const dropdown = new OO.ui.DropdownInputWidget( {
        options: tables.map(function (_, index) {
          return {
            data: index,
            label: mw.msg('vlw-lyrics-editor--ith-table', index+1)
          };
        }),
      } );
      //@ts-ignore
      dropdown.setValue(0);
      loadLyricsData(tables[0]);
      if (tables.length <= 1) { 
        dropdown.setDisabled(true); 
      }
      dropdown.on('change', (idx: string) => {
        clearHotTable();
        loadLyricsData(tables[+idx]);
      });
      $modalContent.find('#lyrics-editor-table-selector').append(dropdown.$element);
    } else {
      $modalContent.find('#lyrics-editor-table-selector').html('').append(
        $('<p>').text(mw.msg('vlw-lyrics-editor--no-table-found'))
      );
    }
  }
    
  // =================
  //   Initialization  
  // =================
  function installModal (): void {
    $modal = $('<div>', { "class": "lyrics-editor-modal" })
      .hide()
      .append(
        $('<div>', { "class": "lyrics-editor-modal-box" })
          .append(
            $('<span>', { "class": "close" }).text("✕")
          )
          .append(
            $('<div>', { "class": "lyrics-editor-modal-content" })
              .append(
                $('<div>', { id: 'lyrics-editor-table-selector' })
              )
              .append(
                $('<div>', { id: 'lyrics-editor-jstable-container-wrapper' })
                  .append(
                    $('<div>', { id: 'lyrics-editor-jstable-container' })
                  )
              )
              .append(
                $('<div>', { id: 'lyrics-editor-loader' })
                  .text(mw.msg('vlw-lyrics-editor--now-loading'))
              )
              .append(
                $('<div>', { id: 'lyrics-editor-bug-report' })
                  .append(
                    mw.message('vlw-lyrics-editor--report-message').parseDom()
                  )
              )
          )
      );
    $('body').append($modal);
    $modalContent = $modal.find('.lyrics-editor-modal-content');
    $('.lyrics-editor-modal .close').on('click', function() {
      closeModal();
    });
  }

  function findListOfActionButtons (skin: string): JQuery<HTMLElement> | null {
    let list: JQuery<HTMLElement> | null;
    switch (skin) {
      case "vector-2022":
      case "vector":
        list = $('#p-cactions div.vector-menu-content ul.vector-menu-content-list');
        break;
      case "minerva":
        list = $('#page-actions #page-actions-overflow #p-tb');
        break;
      case "monobook":
      case "timeless":
      case "mirage":
        list = $('#p-cactions ul');
        $('#p-cactions').removeClass('emptyPortlet');
        break;
      case "medik":
        list = $('#p-actions ul');
        break;
      case "citizen":
        list = $('#p-cactions .citizen-menu__content .citizen-menu__content-list');
        break;
      default:
        list = null;
    }
    return list;
  }

  function addButton (skin: string, $list: JQuery<HTMLElement>): void {
    const commonId = 'ca-edit-lyrics';
    if ($('#'+commonId).length > 0) return; 
    let tag = '<a>';
    if (['minerva', 'citizen'].indexOf(skin) > -1) {
      tag = '<span>';
    }
    $a = $(tag, {
      text: mw.msg('vlw-lyrics-editor--menu-prompt'),
      title: mw.msg('vlw-lyrics-editor--menu-tooltip'),
    }).data('source', false).on('click', function () {
      $modal.show();
      loadModalUtilities();
    });
    switch (skin) {
      case "vector-2022":
      case "vector":
      case "monobook":
      case "timeless":
      case "mirage":
      case "medik":
        $('<li>')
          .attr('id', commonId)
          .append($a)
          .addClass('mw-list-item')
          .appendTo($list);
        break;
      case "minerva":
        $a = $a.addClass('toggle-list-item__label');
        $('<li>')
          .attr('id', commonId)
          .append(
            $('<a>')
            .append(
              $('<span>', { class: 'mw-ui-icon mw-ui-icon-minerva-infoFilled' })
            )
            .addClass('toggle-list-item__anchor menu__item--page-actions-overflow-protect')
            .append($a)
          )
          .addClass('toggle-list-item')
          .appendTo($list);
        break;
      case "citizen":
        $('<li>')
          .attr('id', commonId)
          .append(
            $('<a>')
            .append(
              $('<span>', { class: 'citizen-ui-icon mw-ui-icon-infoFilled mw-ui-icon-wikimedia-infoFilled' })
            )
            .append($a)
          )
          .addClass('mw-list-item')
          .appendTo($list);
          break;
    }
  }

  function init(skin: string): void {
    installModal();
    $list = findListOfActionButtons(skin);
    if (!!$list && $list.length) {
      addButton(skin, $list);
    }
  }

  // =================
  //   Entrypoint
  // =================
  mw.loader.getScript( 'https://cdn.jsdelivr.net/npm/handsontable@16.1.1/dist/handsontable.full.min.js?ctype=text/javascript' )
    .then(function() {
      mw.loader.load( 'https://cdn.jsdelivr.net/npm/handsontable@16.1.1/styles/handsontable.min.css?ctype=text/css', 'text/css' );
      mw.loader.load( 'https://cdn.jsdelivr.net/npm/handsontable@16.1.1/styles/ht-theme-main.min.css?ctype=text/css', 'text/css' );
      mw.hook('wikipage.content').add(function () {
        init(config.skin);
      });
    }, function () {
      console.error("Failed to load Handsontable JS dependency for Gadget-lyrics-editor.js", DEBUGGING_ID);
    });
})(mediaWiki, jQuery);