/* [[Category:Scripts]] */
(function (mw, $) {
	'use strict';

	function AlbumFetchUtils(serverCacheMaxAge) {
		this.api = new mw.Api();
		this.titles = this.findAlbumSongTitles();
		this.lookForCategories = {
			titles: [],
			fetched: {},
			mapToEvents: {},
			mapToResults: {},
		};
		this.serverCacheMaxAge = serverCacheMaxAge;
		this.apiMaxLimit = 500;
	}
	AlbumFetchUtils.prototype.findAlbumSongTitles = function () {
		var titles = [];
		$('.album-infobox ol > li > a').each(function () {
			titles.push( $(this).attr('title') );
		});
		return titles;
	};
	AlbumFetchUtils.prototype.registerCategory = function (title, event) {
		title = 'Category:' + title;
		if (this.lookForCategories.fetched[title] !== undefined) { return; }
		this.lookForCategories.titles.push(title);
		this.lookForCategories.fetched[title] = false;
		this.lookForCategories.mapToEvents[title] = event;
		this.lookForCategories.mapToResults[title] = [];
	};
	AlbumFetchUtils.prototype.createQueryPromises = function (categories) {
		var promises = [];
		var batchCategories = [];
		if (this.titles.length === 0) return [promises, batchCategories];
		var ctPerQuery = Math.floor(this.apiMaxLimit / this.titles.length);
		var numQueries = Math.ceil(categories.length / ctPerQuery);
		for (var i = 0; i < numQueries; i++) {
			var fetchCats = categories
				.slice(i*ctPerQuery, (i+1)*ctPerQuery);
			promises.push(this.api.get( {
				action: 'query',
				format: 'json',
				prop: 'categories',
				cllimit: 500,
				clcategories: fetchCats.join('|'),
				titles: this.titles.join('|'),
				redirects: true,
				maxage: this.serverCacheMaxAge || 0,
				smaxage: this.serverCacheMaxAge || 0
			} ));
			batchCategories.push(fetchCats);
		}
		return [promises, batchCategories];
	};
	AlbumFetchUtils.prototype.processSettledPromise = function (results, categories) {
		if (results.status === 'rejected') {
			mw.errorLogger.logError(results.reason, "songs-browser-utils");
			return;
		}
		var i;
		var data = results.value;
		if (!data.query) { 
			mw.errorLogger.logError("The MediaWiki API has returned zero results.", "songs-browser-utils");
			if (!!data.error) {
				mw.errorLogger.logError("Error message from the API: ", data.error.info || data.error, "songs-browser-utils");
			}
			return;
		}
		
		var mapRedirects = {};
		if ('redirects' in data.query) {
			for (i = 0; i < data.query.redirects.length; i++) {
				mapRedirects[data.query.redirects[i].to] = data.query.redirects[i].from;
			}
		}
		var kv = Object.entries(data.query.pages || {});
		for (i = 0; i < kv.length; i++) {
			if (+kv[i][0] < 0) { continue; }
			var o = kv[i][1];
			var pageTitle = o.title;
			if (pageTitle in mapRedirects) {
				pageTitle = mapRedirects[pageTitle];
			}
			if ("categories" in o) {
				var foundCats = [];
				for (var j = 0; j <o.categories.length; j++) {
					var category = o.categories[j].title;
					this.lookForCategories.mapToResults[category].push(pageTitle);
				}
			}
		}
		for (i = 0; i < categories.length; i++) {
			this.lookForCategories.fetched[categories[i]] = true;
		}
	};
	AlbumFetchUtils.prototype.publishResultsToObserver = function (category) {
		var event = this.lookForCategories.mapToEvents[category];
		var categoryMembers = this.lookForCategories.mapToResults[category];
		var elements = $('');
		for (var c = 0; c < categoryMembers.length; c++) {
			var selector = "a[title='" + categoryMembers[c].replaceAll("'", "\\'") + "']";
			elements = elements.add(selector);
		}
		mw.hook(event).fire(elements);
	};
	AlbumFetchUtils.prototype.queryPagesBelongingToUnfetchedCategories = function () {
		var i;
		var categories = Object.entries(this.lookForCategories.fetched)
			.filter(function (kv) { return !kv[1]; })
			.map(function (kv) { return kv[0]; });
		var p = this.createQueryPromises(categories);
		var promises = p[0], catsInBatches = p[1];
		var self = this;
		Promise.allSettled(promises)
			.then(function (arrResults) {
				for (i = 0; i < arrResults.length; i++) {
					self.processSettledPromise(arrResults[i], catsInBatches[i]);
				}
				for (i = 0; i < categories.length; i++) {
					self.publishResultsToObserver(categories[i]);
				}
			})
			.catch(function (err) {
				mw.errorLogger.logError(err, "songs-browser-utils");
			});
	};
	window.AlbumFetchUtils = AlbumFetchUtils;
}(mediaWiki, jQuery));