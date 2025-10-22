/*! All JavaScript here will be loaded for users of the Citizen skin */
'use strict';

$( function() {  
  //! Add sidebar icon to "Create new page" menu option
  $( '#p-navigation ul.citizen-menu__content-list li#n-createpage > a:first-child() ' )
    .prepend( '<span class="citizen-ui-icon mw-ui-icon-recentChanges mw-ui-icon-wikimedia-recentChanges"></span>' );
  //! Add icon to "Create Redirect" menu option on Related Tools
  $( '#p-tb ul.citizen-menu__content-list li#t-createredirect > a:first-child() ' )
    .prepend( '<span class="citizen-ui-icon mw-ui-icon-recentChanges mw-ui-icon-wikimedia-recentChanges"></span>' );
});

/*! Configure collapsible submenus on sidebar */
$('#citizen-drawer__card .mw-portlet > .citizen-menu__content').addClass('collapse');
$('#p-navigation > .citizen-menu__content, #p-special-pages > .citizen-menu__content').addClass('show');
$('#citizen-drawer__card .mw-portlet[id^=\'p-^\'] > .citizen-menu__heading')
  .text(function () { return $(this).text().replace(/^\s*\^/, ''); });
$('#citizen-drawer__card .mw-portlet[id^=\'p-^\'] > .citizen-menu__content')
  .addClass('show');
$('#citizen-drawer__card .mw-portlet > .citizen-menu__heading').append( $('<div>').addClass('menu-btn') );
$('#citizen-drawer__card .mw-portlet > .citizen-menu__heading').on('click', function (event) {
  $(this).next().toggleClass('show');
  event.preventDefault();
  event.stopPropagation();
});