interface IBandcampEmbedUrlParams {
	album: number
	track: number
	bgcol: string
	linkcol: string
	size?: 'small' | 'large'
  minimal?: boolean
	tracklist?: boolean
	artwork?: 'none' | 'small' | 'large'
	transparent?: boolean
}
  
(function (mw, $) {

  const maxWidth = 400;

  function installBandcampEmbed(this: HTMLElement) {
    const albumId = $(this).data("album-id");
    const trackId = $(this).data("track-id");
    const mode = $(this).data("mode") || 1;
    if (!albumId || !trackId) {
      return;
    }

    const containerWidth = $(this).innerWidth() || maxWidth;

    let width: string | number;
    let height: string | number;
    let urlParams: IBandcampEmbedUrlParams;

    const bgcol = '333333';
    const linkcol = 'ffffff';

    switch (mode) {
      //! art-only
      case 1:
        width = Math.min(containerWidth, maxWidth);
        height = Math.min(containerWidth, maxWidth);
        urlParams = {
          album: albumId,
          track: trackId,
          bgcol, linkcol,
          size: 'large',
          minimal: true,
          transparent: true
        };
        break;
      //! slim
      case 2:
        width = '100%';
        height = '120px';
        urlParams = {
          album: albumId,
          track: trackId,
          bgcol, linkcol,
          size: 'large',
          tracklist: false,
          artwork: 'small',
          transparent: true
        };
        break;
      //! tracklist
      case 3:
        width = '100%';
        height = '300px';
        urlParams = {
          album: albumId,
          track: trackId,
          bgcol, linkcol,
          size: 'large',
          artwork: 'small',
          transparent: true
        };
        break;
      //! playbutton 
      case 4:
        width = '100%';
        height = '42px';
        urlParams = {
          album: albumId,
          track: trackId,
          bgcol, linkcol,
          size: 'small',
          tracklist: false,
          artwork: 'none',
          transparent: true
        };
        break;
      default:
        return;
    }

    const src = `https://bandcamp.com/EmbeddedPlayer${
      Object.entries(urlParams).map(([k, v]) => `/${k}=${v}`).join('')
    }`;
    const $iframe = $("<iframe>", {
      src,
      width,
      height,
      allowtransparency: "true",
      frameborder: "0",
      sandbox: "allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
    });

    $(this).html('').append($iframe);
  }

  function resizeBandcampEmbeds(this: HTMLElement) {
    const mode = $(this).data('mode');
    /*! The other modes are set to have width:100%, so we're only concerned with mode=1 */
    if (mode === 1) {
      const containerWidth = $(this).innerWidth() || maxWidth;
      $(this).find('iframe').css('width', Math.min(containerWidth, maxWidth));
      $(this).find('iframe').css('height', Math.min(containerWidth, maxWidth));
    }
  }

  /*! Initialize */
  mw.hook('wikipage.content').add(() => {
    $(".bandcamp-embed").each(installBandcampEmbed);
  });
  
  /*! Specific to Vocaloid Lyrics Wiki, we want to watch for these breakpoints */
  const breakpoints = [
    '(max-width: 400px)',
    '(min-width: 401px) and (max-width: 500px)',
    '(min-width: 501px) and (max-width: 767px)',
    '(min-width: 768px)'
  ];
  breakpoints.forEach((bp) => {
    window.matchMedia(bp).addEventListener('change', (mq: MediaQueryListEvent) => {
      if (mq.matches) {
        $(".bandcamp-embed").each(resizeBandcampEmbeds);
      }
    });
  });
}(mediaWiki, jQuery));