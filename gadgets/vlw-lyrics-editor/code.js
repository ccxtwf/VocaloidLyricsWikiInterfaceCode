/*
 * Gadget-lyrics-editor.js
 * Authored by [[User:CoolMikeHatsune22]] for Vocaloid Lyrics Wiki on Miraheze
 * Using dependencies from [https://handsontable.com Handsontable] v15.3.0 (12 May 2025)
 *
 * This is a gadget/user script focused upon the editing of lyrics tables (wikitable format) throughout the wiki.
 */
/* [[Category:Scripts]] */
(function (mw, $) {
  'use strict';
  
  // Only on desktop
  if (((window.screen || {}).width || window.innerWidth) < 500 || ((window.screen || {}).height || window.innerHeight) < 500) { return; }
  
  // Only load once
  if ($('#ca-edit-lyrics').length > 0) { return; }
  
  // =================
  //   Configuration
  // =================
  var config = mw.config.get([
    'wgAction',
    'skin'
  ]);
  var maxHotTableColumns = 5 + 1;  // Max 5 columns per table
  var editorTextAreaSelector = '#wpTextbox1';
  var $list, $a, $modal, $modalContent, $hotTable;

  // =================
  //   Utility Functions
  // =================
  var rxMatchBolded = /^\s*('{3})(.*)\1\s*$/;
  var rxMatchBoldedCss = /font-weight\s*:\s*bold\b\s*;*/;
  var rxMatchItalicised = /^\s*('{2})((?<=\1)(?:(?!')|'{3}(?!')).*(?:(?<!')|(?<!')'{3})(?=\1))\1\s*$/;
  var rxMatchItalicisedCss = /font-style\s*:\s*italic\b\s*;*/;
  
  function getWikipageTables (wikipageContents) {
    var rx = /(\{\|\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]table[ _]class\}\}\s*\n\|-\s*class\s*=\s*["'][^\n]*\blyrics-table-header\b[^\n]*["']\s*\n!\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]header\}\})\s*\n([^]*?\|\})/g;
    return Array.from(wikipageContents.matchAll(rx));
  }
  
  function parseLyrics (tableBody) {
    var lyrics = [];
    var numColumns = 0; 
    var tableRows = Array.from(tableBody.matchAll(/\|-(.*?)\n([^]*?)\n(?=\|-|\|\})/g))
      .map(function (tableRow) {
        var contents = tableRow[0];
    	var customStyle = tableRow[1].match(/style\s*=\s*["']\s*([^\n]*?)\s*;*\s*["']/);
    	customStyle = customStyle === null ? '' : customStyle[1]+';';
    	var lines = "\n" + tableRow[2];
    	var rxResults = lines.matchAll(/(?<=\n\|).*?(?=\n\||$)/g);
    	var splitLyrics = Array.from(rxResults).map(function (res) { return res[0]; });
    	numColumns = Math.max(numColumns, splitLyrics.length);
    	return { contents: contents, customStyle: customStyle, splitLyrics: splitLyrics };
      });
    numColumns = Math.min(maxHotTableColumns, numColumns);
    for (var i = 0; i < tableRows.length; i++) {
	  var customStyle = tableRows[i].customStyle;
	  var splitLyrics = tableRows[i].splitLyrics;
      var lyricRow, j;
      if (splitLyrics.length === 1) {
        var rxCheckSharedColumn = /^\s*(\{\{(?:[Tt]emplate:|)shared[^\}]*\}\}|colspan=\s*(?:["']|)\s*\d+\s*(?:["']|)\s*\|)/gi;
        var sharedRow = splitLyrics[0];
        if (sharedRow.match(/^\s*<br\s*\/?\s*>\s*$/)) {
          lyricRow = [customStyle];
          for (j = 0; j < numColumns; j++) {
            lyricRow.push('');
          }
          lyrics.push(lyricRow);
        } else if (sharedRow.match(rxCheckSharedColumn)) {
          sharedRow = sharedRow.replace(rxCheckSharedColumn, '');
          lyricRow = [customStyle];
          for (j = 0; j < numColumns; j++) {
            lyricRow.push(sharedRow);
          }
          lyrics.push(lyricRow);
        } else {
          lyricRow = [customStyle, splitLyrics[0] || ''];
          for (j = 1; j < numColumns; j++) {
            lyricRow.push('');
          }
          lyrics.push(lyricRow);
        }
      } else {
        lyricRow = [customStyle];
        for (j = 0; j < numColumns; j++) {
          lyricRow.push(splitLyrics[j] || '');
        }
        lyrics.push(lyricRow);
      }
    }
    
    return [lyrics, numColumns];
  }
  
  function buildLyricsTable(tableHeaders, lyricsData) {
  	var sb = tableHeaders + "\n";
  	var i, j;
  	for (i = 0; i < lyricsData.length; i++) {
  	  sb += "|-";
  	  var customStyle = (lyricsData[i][0] || '').trim();
  	  if (customStyle !== '') {
  	  	sb += "style=\"" + customStyle + "\"";
  	  }
  	  sb += "\n";
  	  var isShared = (lyricsData[i].length > 2);	// isShared = true unless if there's only one lyrics column
  	  var firstCell = (lyricsData[i][1] || '').trim();
  	  for (j = 2; j < lyricsData[i].length; j++) {
  	    if ((lyricsData[i][j] || '').trim() !== firstCell) {
  	      isShared = false;
  	      break;
  	    }
  	  }
  	  if ((isShared || lyricsData[i].length === 2) && firstCell === '') {
  	    sb += "|<br />\n";
  	  } else if (isShared) {
  	  	sb += "| {{shared}} " + firstCell + "\n";
  	  } else {
  	  	for (j = 1; j < lyricsData[i].length; j++) {
  	      sb += "|" + 
  	        (lyricsData[i][j] || '')
	  	      .replace(/^-/, "<nowiki>-</nowiki>")
	  	      .replace(/(?<!<nowiki>)(~{4,})(?!<\/nowiki>)/g, '<nowiki>$1</nowiki>') + "\n";
  	    }
  	  }
  	}
  	sb += "|}";
  	return sb;
  }

  // =================
  //   HotTable Dependency 
  // =================
  function getSelectedRowData(instance) {
    if (!instance.getSelectedRange() || instance.getSelectedRange().length === 0) {
      return;
    }
    var fromRow = instance.getSelectedRange()[0].from.row;
    var toRow = instance.getSelectedRange()[0].to.row;
    var selectedRows = [];
    for (var i = fromRow; i <= toRow; i++) {
      selectedRows.push(instance.getDataAtRow(i));
    }
    return selectedRows;
  }
  
  function resetColumnHeaders(numColumns) {
    var columnHeaders = ['Row style'];
    var columnWidths = [160];
    for (var i = 0; i < numColumns; i++) {
      columnHeaders.push("Column " + (i+1));
      columnWidths.push(250);
    }
    $hotTable.updateSettings({
      colHeaders: columnHeaders,
      colWidths: columnWidths,
    });
  }
  
  function _cbHottableOnPaste(key, selection, clickEvent) {
    var i, j;
    var fromRow = null, fromCol = null, toRow = null, toCol = null;
    if (selection && selection.length) {
      fromRow = selection[0].start.row;
      fromCol = selection[0].start.col;
      toRow = selection[0].end.row;
      toCol = selection[0].end.col;
    } else {
      return;
    }
    navigator.clipboard.readText()
      .then(function (str) {
        var pasted = str.split(/\n/).map(function (line) { return line.split(/\t/); });
        var numExistingRows = this.getData().length;
        var numOverlappedExistingRows = Math.min(
          numExistingRows - fromRow,
          pasted.length
        );
        var numOverflowedRows = pasted.length - numOverlappedExistingRows;
        var numPastedColumns = 0;
        for (i = 0; i < pasted.length; i++) {
          numPastedColumns = Math.max(numPastedColumns, pasted[i].length);
        }
        var changes = [];
            
        if (fromRow === toRow && fromCol === toCol) {
          // Starting cell is a single cell
          // In this case, limit the paste range to rows after fromRow and columns after fromCol
          var numOverlappedExistingColumns = Math.min(this.countCols(), numPastedColumns);
          for (i = 0; i < numOverlappedExistingRows; i++) {
            for (j = 0; j < numOverlappedExistingColumns; j++) {
              changes.push([fromRow+i, j, pasted[i][j] || '']);
            }
          }
          for (i = 0; i < numOverflowedRows; i++) {
            for (j = 0; j < numOverlappedExistingColumns; j++) {
              changes.push([numExistingRows+i, j, pasted[numOverlappedExistingRows+i][j] || '']);
            }
          }
        } else {
          // Starting cell is a multi-cell range
          // In this case, limit the paste range to the columns within fromCol & toCol, 
          // and to rows below (equal to or more than) fromRow
          for (i = 0; i < numOverlappedExistingRows; i++) {
            for (j = fromCol; j <= toCol; j++) {
              changes.push([fromRow+i, j, pasted[i][j-fromCol] || '']);
            }
          }
          for (i = 0; i < numOverflowedRows; i++) {
            for (j = fromCol; j <= toCol; j++) {
              changes.push([numExistingRows+i, j, pasted[numOverlappedExistingRows+i][j-fromCol] || '']);
            }
          }
        }
            
        this.setDataAtCell(changes);
      })
      .catch(function () {
        window.alert("Unable to paste! Please use keyboard command (Ctrl/Cmd + V)!");
      });
  }
  
  // Criteria for unbold/unitalicize: At least one row must be styled
  // Criteria for bold/italicize: Every row must not be styled
  // Return the boolean value to set whether the option should be hidden
  function _cbHottableCheckForStyleInSelection (rowInlineCss, cellWikitextMarkup, modeRemoveStyle) {
  	return function() {
      var selectedRows = getSelectedRowData(this);
      var res;
      if (modeRemoveStyle) {
        res = selectedRows.some(function (row) {
          if ((row[0] || '').match(rowInlineCss) !== null) return true; 
          for (var i = 1; i < row.length; i++) {
            if ((row[i] || '').trim() !== '' && row[i].match(cellWikitextMarkup) !== null) {
              return true;
            } 
          }
          return false;
        });
      } else {
      	res = selectedRows.every(function (row) {
          if ((row[0] || '').match(rowInlineCss) !== null) return false; 
          for (var i = 1; i < row.length; i++) {
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
  
  function _cbHottableAddStyle(customStyle) {
  	return function (key, selection, clickEvent) {
      var fromRow = null, toRow = null;
      if (selection && selection.length) {
        fromRow = selection[0].start.row;
        toRow = selection[0].end.row;
      } else {
        return;
      }
      var data = this.getData();
      for (var i = fromRow; i <= toRow; i++) {
        var row = data[i];
        if (!data[i][0]) data[i][0] = '';
        data[i][0] += customStyle;
      }
      this.loadData(data);
    };
  }
  
  function _cbHottableRemoveStyle(rowInlineCss, cellWikitextMarkup) {
  	return function (key, selection, clickEvent) {
      var fromRow = null, toRow = null;
      if (selection && selection.length) {
        fromRow = selection[0].start.row;
        toRow = selection[0].end.row;
      } else {
        return;
      }
      var data = this.getData();
      for (var i = fromRow; i <= toRow; i++) {
      	data[i][0] = (data[i][0] || '').replace(rowInlineCss, "");
        for (var j = 1; j < data[i].length; j++) {
          data[i][j] = (data[i][j] || '').replace(cellWikitextMarkup, '$2');
        }
      }
      this.loadData(data);
    };
  }
  
  var contextMenu = {
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
          if (this.countCols() >= maxHotTableColumns) { return true; }
          if (!this.getSelectedRange() || this.getSelectedRange().length === 0) {
            return false;
          }
          var fromCol = this.getSelectedRange()[0].from.col;
          if (fromCol === 0) { return true; }
          return false;
        },
        callback: function () {
          if (!this.getSelectedRange() || this.getSelectedRange().length === 0) {
            return;
          }
          var fromCol = this.getSelectedRange()[0].from.col;
          this.alter('insert_col_start', fromCol);
          resetColumnHeaders(this.countCols());
        }
      }, 
      col_right: { 
        disabled: function () {
          return (this.countCols() >= maxHotTableColumns);
        },
        callback: function () {
          if (!this.getSelectedRange() || this.getSelectedRange().length === 0) {
            return;
          }
          var toCol = this.getSelectedRange()[0].to.col;
          this.alter('insert_col_end', toCol);
          resetColumnHeaders(this.countCols());
        } 
      }, 
      remove_row: { disabled: false },
      remove_col: { 
        disabled: function () {
          if (!this.getSelectedRange() || this.getSelectedRange().length === 0) {
            return;
          }
          var fromCol = this.getSelectedRange()[0].from.col;
          if (fromCol === 0) { return true; }
          return false;
        },
        callback: function () {
          if (!this.getSelectedRange() || this.getSelectedRange().length === 0) {
            return;
          }
          var fromCol = this.getSelectedRange()[0].from.col;
          var toCol = this.getSelectedRange()[0].to.col;
          this.alter('remove_col', fromCol, toCol-fromCol+1);
          resetColumnHeaders(this.countCols());
        }
      },
      clear_column: { disabled: false }
    }
  };
  
  function clearHotTable() {
  	if ($hotTable) {
	  $hotTable.destroy();
	  $('#lyrics-editor-jstable-container-wrapper').html(
	    '<div id="lyrics-editor-jstable-container"></div>'
	  );
	}
  }
  
  function resetColumnHeadersOnUndoRedo(action) {
    var actionType = action.actionType;
    if (actionType === 'insert_col' || actionType === 'remove_col') {
      resetColumnHeaders(this.countCols());
    }
  }
  
  // =================
  //   Run on loaded modal
  // =================
  function replaceLyricsTable (tableRegexResults) {
  	var oldTable = tableRegexResults[0];
    var newTable = buildLyricsTable(tableRegexResults[1], $hotTable.getData());
    var oldWikitext = $(editorTextAreaSelector).val();
    var newWikitext = oldWikitext.replace(oldTable, newTable);
    $(editorTextAreaSelector).val(newWikitext);
  }
  
  function closeModal () {
  	$modal.hide();
    clearHotTable();
    $modalContent.find('#lyrics-editor-table-selector').html('');
    $modalContent.find('#lyrics-editor-jstable-container').html('');
    $modalContent.find('#lyrics-editor-loader').show();
  }
  
  function loadLyricsData (tableRegexResults) {
  	var pl = parseLyrics(tableRegexResults[2]);
  	var lyrics = pl[0], numColumns = pl[1];
    $hotTable = new Handsontable(
      document.getElementById('lyrics-editor-jstable-container'), {
        data: lyrics,
        rowHeaders: true,
        contextMenu: contextMenu,
        width: '100%',
        // height: '100%',
        autoWrapRow: true,
        autoWrapCol: true,
        licenseKey: 'non-commercial-and-evaluation'
    });
    $hotTable.addHook('afterUndo', resetColumnHeadersOnUndoRedo);
    $hotTable.addHook('afterRedo', resetColumnHeadersOnUndoRedo);
    resetColumnHeaders(numColumns);
    $('#lyrics-editor-jstable-container').css('overflow-x', 'hidden');
    var confirmButton = new OO.ui.ButtonWidget( {
      label: 'Replace Lyrics Table',
      icon: 'check',
      title: 'Replace the lyrics table wikicode'
    } );
    confirmButton.on('click', function () {
      replaceLyricsTable(tableRegexResults);
      closeModal();
      mw.notify( 'Successfully replaced lyrics!' );
    });
    $('#lyrics-editor-jstable-container-wrapper').append(
      $('<div id="lyrics-editor-actions"></div>').append(confirmButton.$element)
    );
  }
    
  function loadModalUtilities () {
    var tables = getWikipageTables($(editorTextAreaSelector).val());
    $modalContent = $('.lyrics-editor-modal-content');
    $modalContent.find('#lyrics-editor-loader').hide();
    if (tables.length) {
      $modalContent.find('#lyrics-editor-table-selector').html('<p>Found ' + tables.length + ' table(s)</p>');
      var dropdown = new OO.ui.DropdownInputWidget( {
        options: tables.map(function (table, index) {
          return {
            data: index,
            label: 'Table #' + (index+1)
          };
        }),
      } );
      dropdown.setValue(0);
      loadLyricsData(tables[0]);
      if (tables.length <= 1) { dropdown.setDisabled(true); }
      dropdown.on('change', function(idx) {
        clearHotTable();
        loadLyricsData(tables[idx]);
      });
      $modalContent.find('#lyrics-editor-table-selector').append(dropdown.$element);
    } else {
      $modalContent.find('#lyrics-editor-table-selector').html('<p>No table found</p>');
    }
  }
    
  // =================
  //   Initialization  
  // =================
  function installModal () {
    $modal = $(
      '<div class="lyrics-editor-modal" style="display:none;">' + 
        '<div class="lyrics-editor-modal-box">' + 
          '<span class="close">&times;</span>' +
          '<div class="lyrics-editor-modal-content">' + 
            '<div id="lyrics-editor-table-selector"></div>' +
            '<div id="lyrics-editor-jstable-container-wrapper">' +
              '<div id="lyrics-editor-jstable-container"></div>' +
            '</div>' +
            '<div id="lyrics-editor-loader">Now loading...</div>' +
            '<div id="lyrics-editor-bug-report">' + 
              'You can report any bugs to ' + 
              '<a href="/wiki/MediaWiki_talk:Gadget-lyrics-editor" target="_blank">MediaWiki talk:Gadget-lyrics-editor</a> ' + 
              'or to <a href="/wiki/User_talk:CoolMikeHatsune22" target="_blank">the script developer\'s user talk page</a>.' + 
            '</div>' +
          '</div>' +
        '</div>' + 
      '</div>'
    );
    $('body').append($modal);
    $modalContent = $modal.find('.lyrics-editor-modal-content');
    $('.lyrics-editor-modal .close').on('click', function() {
      closeModal();
    });
  }
  
  function findListOfActionButtons (skin) {
    var list;
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
        list = [];
    }
    return list;
  }
  
  function addButton (skin) {
    var tag = '<a>';
    if (['minerva', 'citizen'].indexOf(skin) > -1) {
      tag = '<span>';
    }
    $a = $(tag, {
      text: "Edit Lyrics Table",
      title: "Use a script to edit the lyrics more easily."
    }).data('source', false).click(function () {
      $modal.show();
      loadModalUtilities();
    });
    var commonId = 'ca-edit-lyrics';
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
  
  function init(skin) {
    installModal();
    $list = findListOfActionButtons(skin);
    if ($list.length) {
      addButton(skin);
    }
  }
  
  // =================
  //   Entrypoint
  // =================
  mw.loader.getScript( 'https://cdn.jsdelivr.net/npm/handsontable@15.3.0/dist/handsontable.full.min.js?ctype=text/javascript' )
	.then(function() {
	  mw.loader.load( 'https://cdn.jsdelivr.net/npm/handsontable@15.3.0/styles/handsontable.min.css?ctype=text/css', 'text/css' );
	  mw.loader.load( 'https://cdn.jsdelivr.net/npm/handsontable@15.3.0/styles/ht-theme-main.min.css?ctype=text/css', 'text/css' );
	  mw.hook('wikipage.content').add(function () {
	    init(config.skin);
	  });
	}, function () {
	  console.error("Failed to load Handsontable JS dependency for Gadget-lyrics-editor.js");
	});
    
}(mediaWiki, jQuery));