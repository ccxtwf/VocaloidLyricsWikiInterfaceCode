/* All JavaScript here will be loaded for users of the Medik skin */
'use strict';

/* Configure collapsible sidebar menu */
$('#site-navigation > .mw-portlet > .mw-portlet-body').addClass('collapse');
$('#site-navigation > #p-navigation > .mw-portlet-body, #site-navigation > #p-special-pages > .mw-portlet-body').addClass('show');
$('#site-navigation > .mw-portlet[id^=\'p-^\'] > a.nav-link')
  .text(function () { 
    return $(this).text().replace(/^\^/, ''); 
  });
$('#site-navigation > .mw-portlet[id^=\'p-^\'] > .mw-portlet-body')
  .addClass('show');
$('#site-navigation > .mw-portlet > a.nav-link').append( $('<div>', { 'class': 'menu-btn' }) );
$('#site-navigation > .mw-portlet > a.nav-link').on('click', function (event) {
  $(this).next().toggleClass('show');
  event.preventDefault();
  event.stopPropagation();
});

/* On mobile: automatically scroll the page up if the hamburger menu on the persistent navbar is clicked */
$('#p-logo .mw-hamb').on('click', function () {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});

/* Set scroll offset for mobile & desktop view */
(window as any).MedikScrollOffset = 120;
const mq = window.matchMedia("(max-width: 768px)");
function _onMqChangeMedik(mq: MediaQueryList) {
  if (mq.matches) {
    /*! mobile view */
    (window as any).MedikScrollOffset = 120;
  } else {
    /*! Desktop view */
    (window as any).MedikScrollOffset = 60;
  }
}
_onMqChangeMedik(mq);
mq.addEventListener("change", function() { _onMqChangeMedik(mq); });

/*! When an anchor link is clicked, the browser will offset the vertical scroll position by window.MedikScrollOffset */
function _offsetScrollPosition(hash: string) {
  if (!hash) return;
  hash = $.escapeSelector(decodeURI(hash.substring(1)));
  if ($('#'+hash)) {
    const anchorTag = $("span[id='" + hash + "']");
    $('html, div#content.mw-body').animate({
      scrollTop : (anchorTag.offset()?.top as number) - ((window as any).MedikScrollOffset as number)
    }, 250);
  }
}
$('div#bodyContent a').on('click', function (e: JQuery.ClickEvent<HTMLAnchorElement, undefined, HTMLAnchorElement, HTMLElement>) {
  const hash = e.currentTarget?.hash;
  _offsetScrollPosition(hash);
});

/*! If the page is loaded with a hash (e.g. when loaded from RC or when opening a DiscussionTools post/reply), then offset the scroll position */
if (window.location.hash || '' !== '') {
  _offsetScrollPosition(window.location.hash);
}