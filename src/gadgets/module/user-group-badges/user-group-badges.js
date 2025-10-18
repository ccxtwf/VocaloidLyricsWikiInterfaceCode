(function (mw, $) {
	
	var SERVER_CACHE_MAXAGE = 1 * 24 * 60 * 60;	// 24 hours, in seconds
	
	var config = mw.config.get([
		'wgRelevantUserName',
		'wgNamespaceNumber'
	]);
	var $container;
	var specialGroups;
	
	function loadMessages() {
		specialGroups = {
			'autopatrolled': { name: 'Autopatrolled', description: 'autopatrolled' },
			'bureaucrat': { name: 'Bureaucrat', description: 'a bureaucrat' },
			'sysop': { name: 'Administrator', description: 'an administrator' },
			'interface-admin': { name: 'Interface Administrator', description: 'an interface administrator' },
			'steward': { name: 'Steward', description: 'a steward' },
			'suppress': { name: 'Suppresor', description: 'a suppresor' },
			'translationadmin': { name: 'Translation Administrator', description: 'a translation administrator' },
			'bot': { name: 'Bot', description: 'a bot' },
		};
		mw.messages.set( {
			'error-msg-not-found': 'User not found',
			'error-msg-no-roles': 'User has no roles',
			'hover-text-user-group': 'This user is $1 on the wiki',
			'hover-text-blocked': 'This user is blocked. They will be unblocked at this time: $1'
		} );
	}
	
	/* This is a helper function to check whether Extension:SocialProfile is enabled on the wiki */
	function isExtSocialProfileEnabled() {
		return mw.loader.getModuleNames().some(function (el) {
			return el.startsWith('ext.socialprofile.');
		});
	}
	
	function getUserInfo() {
		return new Promise(function (resolve, reject) {
			new mw.Api().get({
				list: 'users',
				ususers: config.wgRelevantUserName,
				usprop: 'groups|blockinfo',
				maxage: SERVER_CACHE_MAXAGE,
				smaxage: SERVER_CACHE_MAXAGE,
			})
				.done(function (data) {
					if ((data.query.users || []).length === 0) reject(mw.msg('error-msg-not-found'));
					var user = data.query.users[0];
					var roles = user.groups;
					if (!roles) reject(mw.msg('error-msg-no-roles'));
					var foundGroups = roles.filter(function (group) {
						return (specialGroups[group] !== undefined);
					});
					var blockExpiration = user.blockexpiryformatted;
					resolve({ groups: foundGroups, blockExpiration: blockExpiration });
				})
				.fail(reject);
		});
	}
	
	function addBadges(data) {
		data.groups.forEach(function (group) {
			$container.append(
				$('<div>')
					.addClass('user-group-badge')
					.addClass(group)
					.text(specialGroups[group].name)
					.attr('title', mw.msg('hover-text-user-group', specialGroups[group].description))
			);
		});
		if (!!data.blockExpiration) {
			$container.append(
				$('<div>')
					.addClass('user-group-badge')
					.addClass('blocked')
					.text('Blocked')
					.attr('title', mw.msg('hover-text-blocked', data.blockExpiration))
			);
		}
	}
	
	function init() {
		if (config.wgNamespaceNumber !== 2) return; // Only on user pages
		if ($('profile-user-groups-badges').length > 0) return; // Only initialize once
		loadMessages();
		$container = $('<div>').attr('id', 'profile-user-groups-badges');
		var addAfter = isExtSocialProfileEnabled() ? $('#profile-title-container') : $('#firstHeading');
		addAfter.after($container);
		getUserInfo()
			.then(addBadges)
			.catch(console.error);
	}
	
	mw.hook('wikipage.content').add(init);
}(mediaWiki, jQuery));