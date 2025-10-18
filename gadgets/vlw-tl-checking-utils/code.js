/* [[Category:Scripts]] */
(function (mw, $) {
	var config = mw.config.get([
		'wgPageName',
		'wgCategories',
		'skin',
	]); 
	
	// =================
	//   Config
	// =================
	var tlCheckingPage = 'Help_talk:Translation_Checking';	// Underscore is important
	// Badge element to show for songs with multiple translations on queue
	var badgeElementHtml = $('<span>')
        .addClass('chip-multi-tl')
        .attr('title', 'There are multiple translation checking requests for this song on the queue')
        .text('MULTI');

	// =================
	//   Functions
	// =================
	function selectLevelOneTocHeadings() {
		var s = {};
		var parentSelector, linkSelector, textSelector;
		switch (config.skin) {
			case 'citizen':
				parentSelector = '#mw-panel-toc li.citizen-toc-level-1';
				linkSelector = 'a.citizen-toc-link';
				textSelector = '.citizen-toc-heading';
				break;
			case 'vector-2022':
				parentSelector = '#mw-panel-toc li.vector-toc-level-1:not(#toc-mw-content-text)';
				linkSelector = 'a.vector-toc-link';
				textSelector = '.vector-toc-text > span:not(.vector-toc-numb)';
				break;
			default:
				parentSelector = '#toc li.toclevel-1';
				linkSelector = '> a';
				textSelector = '.toctext';
		}
		$(parentSelector).each(function() {
			var t = $(this).find(textSelector).text();
			var href = ($(this).find(linkSelector).attr('href') || '').replace(/^#/, '');
			var m = t.match(/^.+?(?=\s*\|)/);
			if (m !== null) { t = m[0]; }
			if (!(t in s)) { s[t] = {c:0, el:[]}; }
			s[t].c++;
			s[t].el.push({
                n: $(this).find(textSelector),
                l: href
            });
		});
		return s;
	}
	
	function markSongsWithMultipleTranslations() {
        $('.chip-multi-tl').remove();
		var headings = selectLevelOneTocHeadings();
		var setOfMultipleTranslations = Object.values(headings)
			.filter(function (elements) { return elements.c > 1; });
		setOfMultipleTranslations.forEach(function (elements) { 
			elements.el.forEach(function (element) { 
				element.n.append(badgeElementHtml.clone());
				$('#'+$.escapeSelector(element.l)).append(badgeElementHtml.clone());
			});
		});
	}
	
	// =================
	//   Run
	// =================
	mw.hook('wikipage.content').add(markSongsWithMultipleTranslations);
	
}(mediaWiki, jQuery));