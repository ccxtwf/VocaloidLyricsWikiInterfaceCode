/*
* Authored by [[User:CoolMikeHatsune22]]
* Adds a list showing queued translation checking requests on the wiki.
*/
(function (mw, $) {
  'use strict';
  
  var config = mw.config.get([
    'wgArticlePath',
    'skin'
  ]);
  
  // =================
  //   Configuration
  // =================
  var tlCheckingPageName = 'Help talk:Translation Checking';
  var responseCacheExpiration = 15 * 60;					// 15 minutes
  var localStorageCacheExpiration = 30 * 60 * 1000;		// 30 minutes
  var initialNumberOfItems = 5;
  var maxNumberOfItems = 10;
  
  var localStorageDataKey = 'vlw_tl_checking_queue_data';
  var localStorageExpiredKey = 'vlw_tl_checking_queue_cache_expired';
  
  var $container, $onQueueList, $resolvedList;
  
  // =================
  //   Fetching
  // =================
  var linkToPage = mw.util.getUrl(tlCheckingPageName);
  function fetchFromCache() {
    try { 
      var cacheExpiredTime = localStorage.getItem(localStorageExpiredKey);
      if (cacheExpiredTime === null || isNaN(+cacheExpiredTime) || Date.now() > +cacheExpiredTime) {
        clearCache();
      }
      var raw = localStorage.getItem(localStorageDataKey);
      if (raw === null) return null;
      raw = JSON.parse(raw);
      return raw;
    } catch(error) {
      clearCache(); 
      return null;
    }		
  }
  
  function saveToCache(res) {
    localStorage.setItem(localStorageDataKey, JSON.stringify(res));
    localStorage.setItem(localStorageExpiredKey, new Date(Date.now() + localStorageCacheExpiration).getTime());
  }
  
  function clearCache() {
    localStorage.removeItem(localStorageDataKey);
    localStorage.removeItem(localStorageExpiredKey);
  }
  
  function getListOfTranslations(noCacheMode) {
    return new Promise(function (resolve, reject) {
      
      if (noCacheMode) clearCache();
      var cached = fetchFromCache();
      if (cached !== null) {
        resolve(cached);
        return;
      }
      
      $.get(mw.util.getUrl(tlCheckingPageName, {
        action: 'raw',
        maxage: '' + (noCacheMode ? 0 : responseCacheExpiration),
        smaxage: '' + (noCacheMode ? 0 : responseCacheExpiration),
      }))
      .done(function (wikitext) {
        var resolvedTlRequests = [];
        var onQueueTlRequests = [];
        var headings = Array.from(wikitext.matchAll(/(?<=\n)={2}(?!=)\s*([^\n]+?)\s*(?<=)={2}[ \r]*(?=\n)/g));
        for (var i = 0; i < headings.length; i++) {
          var heading = headings[i][1];
          var item;
          var isApproved = undefined;
          var rTemplate = heading.match(/^(.+)\s*\{\{([Aa]ccepted|[Rr]ejected|[Pp]ending)\s*\|?\s*\b([^\}]*)\s*\}\}\s*$/);
          if (rTemplate !== null) {
            heading = rTemplate[1];
            if (rTemplate[2].match(/^[Aa]ccepted$/) !== null) { 
              isApproved = true; 
            } else if (rTemplate[2].match(/^[Rr]ejected/) !== null) { 
              isApproved = false; 
            }
            rTemplate = (rTemplate[3] === '') ? rTemplate[2] : rTemplate[3];
          }
          var linkDirect = linkToPage + (
            '#'+heading.replaceAll(/[\{\}]/g, '').replaceAll(/\s+/g, '_')
          ) + (
            (rTemplate || '').replaceAll(/\s+/g, '_')
          );
          var splitComponents = heading.split(/\s*\|\s*/g);
          if (splitComponents.length < 3) {
            item = {
              title: heading,
              producer: null,
              tlAuthor: null,
              link: linkDirect,
              isApproved: isApproved
            };
          } else {
            item = {
              title: splitComponents[0],
              producer: splitComponents[1],
              tlAuthor: splitComponents.slice(2).join(' | '),
              link: linkDirect,
              isApproved: isApproved
            };
          }
          if (isApproved !== undefined) {
            resolvedTlRequests.unshift(item);
          } else {
            onQueueTlRequests.push(item);
          }
        }
        saveToCache([onQueueTlRequests, resolvedTlRequests]);
        resolve([onQueueTlRequests, resolvedTlRequests]);
      })
      .fail(reject);
    });
  }
  
  // =================
  //   Installation & initialization
  // =================
  function attachRefreshEventHandler() {
    $container.find('#icon-refresh').on('click', function() { 
      populate(true); 
    });
  }
  function attachLoadMoreDataEventHandler(listElement, toggleElement) {
    toggleElement.on('click', function() {
      listElement.find(".hidden").removeClass('hidden');
      $(this).hide();
      listElement.find('.tl-check-page-link').show();
    });
  }
  function reattachEventHandlersOnMqSwitch() {
    attachRefreshEventHandler();
    attachLoadMoreDataEventHandler($onQueueList, $('#on-queue-tl-toggle'));
    attachLoadMoreDataEventHandler($resolvedList, $('#resolved-tl-toggle'));
  }
  function installContainer() {
    var mq;
    switch(config.skin) {
      case "vector-2022":
      case "vector":
        mq = window.matchMedia("(max-width: calc(1119px))");
        function _onMqChangeVector(mq) {
          if (mq.matches) {
            if ($('.mw-footer-container').find('#vlw-tl-queue-container').length > 0) return;
            $('#mw-panel').find('#vlw-tl-queue-container').remove();
            $('.mw-footer-container').prepend($container);
          } else {
            if ($('#mw-panel').find('#vlw-tl-queue-container').length > 0) return;
            $('.mw-footer-container').find('#vlw-tl-queue-container').remove();
            $('#mw-panel').append($container);
          }
          reattachEventHandlersOnMqSwitch();
        }
        _onMqChangeVector(mq);
        mq.addEventListener("change", function() { _onMqChangeVector(mq); });
        break;
      case "medik":
        mq = window.matchMedia("(max-width: 768px)");
        function _onMqChangeMedik(mq) {
          if (mq.matches) {
            if ($('#footer').find('#vlw-tl-queue-container').length > 0) return;
            $('#mw-navigation').find('#vlw-tl-queue-container').remove();
            $('#footer').prepend($container);
          } else {
            if ($('#mw-navigation').find('#vlw-tl-queue-container').length > 0) return;
            $('#footer').find('#vlw-tl-queue-container').remove();
            $('#mw-navigation').append($container);
          }
          reattachEventHandlersOnMqSwitch();
        }
        _onMqChangeMedik(mq);
        mq.addEventListener("change", function() { _onMqChangeMedik(mq); });
        break;
      case "monobook":
        $('#sidebar').append($container);
        break;
      case "timeless":
        mq = window.matchMedia("(max-width: 1099px)");
        function _onMqChangeTimeless(mq) {
          if (mq.matches) {
            if ($('#mw-content-container').find('> #vlw-tl-queue-container').length > 0) return;
            $('#mw-related-navigation').find('#vlw-tl-queue-container').remove();
            $('#mw-content-container').append($container);
          } else {
            if ($('#mw-related-navigation').find('#vlw-tl-queue-container').length > 0) return;
            $('#mw-content-container').find('#vlw-tl-queue-container').remove();
            $('#mw-related-navigation').append($container);
          }
          reattachEventHandlersOnMqSwitch();
        }
        _onMqChangeTimeless(mq);
        mq.addEventListener("change", function() { _onMqChangeTimeless(mq); });
        break;
      case "mirage":
        $('#p-tb').after($container);
        break;
      case "minerva":
        $('.post-content.footer-content').append($container);
        break;
      case "citizen":
        $('.citizen-footer__container').prepend($container);
        break;
      default:
        break;
    }
  }
  
  function init() {
    $container = $('#vlw-tl-queue-container');
    if ($container.length === 0) {
      $container = $('<div id="vlw-tl-queue-container"></div>');
      installContainer();
    }
    $container.html('');
    $container
      .append(
        $('<div>', { "class": 'label' })
          .text('Translations in queue')
        )
      .append(
        $('<div>', { id: 'on-queue-tl-container' })
          .append($('<ul>'))
      )
      .append(
        $('<div>', { "class": 'label' })
          .text('Recently checked')
      )
      .append(
        $('<div>', { id: 'resolved-tl-container' })
          .append($('<ul>'))
      )
      .append(
        $('<a>', { id: 'icon-refresh', title: 'Reload the translation queue' })
          .append($('<img>', { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Refresh_icon.svg/1024px-Refresh_icon.svg.png' }))
          .append(
            $('<span>', { "class": 'label'})
              .text('Reload')
          )
      );
    $onQueueList = $container.find('#on-queue-tl-container > ul');
    $resolvedList = $container.find('#resolved-tl-container > ul');
    attachRefreshEventHandler();
    $onQueueList.injectSpinner();
    $resolvedList.injectSpinner();
  }
  
  function createListItem(tlReqItem, isHidden) {
    var li = $('<li>')
      .append(
        $('<a>', { 
          "class": 'tl-check-req-title', 
          href: tlReqItem.link, 
          target: '_blank', 
          rel: 'nofollow noindex'
        }).text(tlReqItem.title)
      )
      .append(
        $('<div>', { "class": 'tl-check-req-subtitle' })
          .append(
            $('<div>', { 
              "class": (
                tlReqItem.isApproved === undefined ? undefined :
                'tl-check-req-' + (tlReqItem.isApproved ? 'approved' : 'rejected')
              ) 
            })
          )
          .append(
            $('<div>', { "class": 'tl-check-req-producer' })
              .text(tlReqItem.producer || '')
          )
          .append(
            $('<div>', { "class": 'tl-check-req-author' })
              .text(tlReqItem.tlAuthor || '')
          )
      );
    if (isHidden) { li.addClass('hidden'); }
    return li;
  }
  
  function populate(noCacheMode) {
    $onQueueList.html('');
    $resolvedList.html('');
    $('#vlw-tl-queue-container .mw-spinner').show();
    getListOfTranslations(noCacheMode)
      .then(function (res) {
        var onQueueTlRequests = res[0], 
        resolvedTlRequests = res[1];
        var i = 0, n = 0;
        if (onQueueTlRequests.length) {
          n = Math.min(onQueueTlRequests.length, maxNumberOfItems);
          for (i = 0; i < n; i++) {
            $onQueueList.append(createListItem(onQueueTlRequests[i], i >= initialNumberOfItems));
          }
          if (onQueueTlRequests.length > maxNumberOfItems) {
            $onQueueList.append(
              $('<li>', { id: 'on-queue-tl-link', "class": 'tl-check-page-link' })
                .hide()
                .append(
                  $('<a>', { href: linkToPage, target: '_blank', rel: 'nofollow noindex' })
                    .text('View More on the Translation Checking Page')
                )
            );
          }
          if (n > initialNumberOfItems) {
            $onQueueList.append(
              $('<li>', { id: 'on-queue-tl-toggle', "class": 'toggle' }).text('Load more...')
            );
            attachLoadMoreDataEventHandler($onQueueList, $('#on-queue-tl-toggle'));
          }
        } else {
          $onQueueList.append($('<li><i>Currently none</i></li>'));
        }
        if (resolvedTlRequests.length) {
          n = Math.min(resolvedTlRequests.length, maxNumberOfItems);
          for (i = 0; i < n; i++) {
            $resolvedList.append(createListItem(resolvedTlRequests[i], i >= initialNumberOfItems));
          }
          if (onQueueTlRequests.length > maxNumberOfItems) {
            $resolvedList.append($(
              $('<li>', { id: 'resolved-tl-link', "class": 'tl-check-page-link' })
                .hide()
                .append(
                  $('<a>', { href: linkToPage, target: '_blank', rel: 'nofollow noindex' })
                    .text('View More on the Translation Checking Page')
                )
            ));
          }
          if (n > initialNumberOfItems) {
            $resolvedList.append(
              $('<li>', { id: 'resolved-tl-toggle', "class": 'toggle' }).text('Load more...')
            );
            attachLoadMoreDataEventHandler($resolvedList, $('#resolved-tl-toggle'));
          }
        } else {
          $resolvedList.append($('<li><i>Currently none</i></li>'));
        }
      })
      .catch(function (error) {
        $onQueueList.html($('<li>').text('Failed to fetch data'));
        $resolvedList.html($('<li>').text('Failed to fetch data'));
        console.error(error);
      })
      .finally(function() {
        $('#vlw-tl-queue-container .mw-spinner').hide();
      });
  }
  
  // =================
  //   Run
  // =================
  mw.loader.using( ['mediawiki.util', 'jquery.spinner'] ).then(function() {
    init();
    populate(false);
    // mw.hook('wikipage.content') fires several times each page (e.g. refreshing recent changes queue)
  });
  
}(mediaWiki, jQuery));