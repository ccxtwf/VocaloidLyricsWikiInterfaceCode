/* JavaScript placed here will be applied to all skins */
(function (mw, $) {
  'use strict';

	/* Discord Widget */
	(function () {
		const $widgetElement = $("#discord-widget");
		const src = `https://discord.com/widget?id=${$widgetElement.data("id")}&theme=${$widgetElement.data("theme")}`;
		const $iframe = $("<iframe>", {
			src: src,
			width: $widgetElement.data("width"),
			height: $widgetElement.data("height"),
			allowtransparency: "true",
			frameborder: "0",
			sandbox: "allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
		});
		//@ts-ignore
		$widgetElement.html($iframe);
	})();
	
	/* Add custom Add New Topic for Discussion Tools */
	mw.loader.using( 'mediawiki.util', function () {
    const addTopicButtonId = 'custom-btn-add-new-topic';
    if ($('#'+addTopicButtonId).length > 0) return;
		if (
			mw.config.get('wgAction') === 'view' && 
			((mw.config.get('wgDiscussionToolsFeaturesEnabled') || {}) as { newtopictool?: boolean })?.newtopictool && 
			((mw.config.get('wgDiscussionToolsFeaturesEnabled') || {}) as { replytool?: boolean })?.replytool
		) {
			$('#contentSub').after(
        $('<div>', { id: addTopicButtonId })
          .append(
            $('<a>', { 
              href: mw.util.getUrl(null, { action: 'edit', section: 'new' }), 
              title: "Add a new topic to the discussion"
            }).text("+ Add Topic")
          )
      );
		}
	});
}(mediaWiki, jQuery));