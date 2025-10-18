/* All JavaScript here will be loaded for users of the Timeless skin */
'use strict';

/* Collapsible navigation menus */
$('#site-navigation > .sidebar-inner > .mw-portlet > .mw-portlet-body').addClass('collapse');
$('#p-navigation > .mw-portlet-body, #p-special-pages > .mw-portlet-body').addClass('show');
$('#site-navigation > .sidebar-inner > .mw-portlet[id^=\'p-^\'] > h3')
  .text(function () { return $(this).text().replace(/^\^/, ''); });
$('#site-navigation > .sidebar-inner > .mw-portlet[id^=\'p-^\'] > .mw-portlet-body')
  .addClass('show');
$('#site-navigation > .sidebar-inner > .mw-portlet > h3').append( $('<div>').addClass('menu-btn') );
$('#site-navigation > .sidebar-inner > .mw-portlet > h3').on('click', function (event) {
  $(this).next().toggleClass('show');
  event.preventDefault();
  event.stopPropagation();
});