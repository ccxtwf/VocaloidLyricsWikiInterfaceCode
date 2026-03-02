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