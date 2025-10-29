/*! All JavaScript here will be loaded for users of the Vector 2022 skin */
'use strict';

/*! Configure collapsible submenus on sidebar */
$('#vector-main-menu .mw-portlet > .vector-menu-content').addClass('collapse');
$('#p-navigation > .vector-menu-content, #p-special-pages > .vector-menu-content').addClass('show');
$('#vector-main-menu .mw-portlet[id^=\'p-^\'] > .vector-menu-heading')
  .text(function () { 
    return $(this).text().replace(/^\s*\^/, ''); 
  });
$('#vector-main-menu .mw-portlet[id^=\'p-^\'] > .vector-menu-content')
  .addClass('show');
$('#vector-main-menu .mw-portlet > .vector-menu-heading').append( $('<div>').addClass('menu-btn') );
$('#vector-main-menu .mw-portlet > .vector-menu-heading').on('click', function (event) {
  $(this).next().toggleClass('show');
  event.preventDefault();
  event.stopPropagation();
});