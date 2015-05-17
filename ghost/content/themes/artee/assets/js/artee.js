/* artee Theme javascripts module */
var artee = (function($) {

	'use strict';
	var docElem = document.documentElement,
		siteContentPost = '.artee-index-post',
		siteIndexSortSelect = '.artee-sort-options',
		siteIndexShuffleSelect = '.artee-sort-groups-options',
		indexImageContainer = '.artee-index-post-img',
		indexImageOverlay = '.artee-image-overlay',
		galleryClass = '.artee-gallery',
		imagePopupClass = '.artee-image-popup',
		imagePopupClassFiltered = '.filtered .artee-image-popup',
		gMapsClass = '.gmaps',
		backToTopButton = '.artee-back-to-top',
		loadMoreButton = '.artee-load-more',
		indexGridId = '#artee-grid',
		olderPostsClass = '.older-posts',
		articleIndexGridId = '#artee-grid',
		twentyTwenty = '.twentytwenty-container',
		mobileMenuButton = '.artee-mobile-menu a',
		mobileMenuCloseButton = '.artee-mobile-close-btn',
		mainMenu = '.artee-menu',
		sortMenus = '.artee-index-sort',
		sortMobileActivator = '.artee-mobile-sort > i.fa',

		_userAgentInit = function() {
			docElem.setAttribute('data-useragent', navigator.userAgent);
		},
		/* gallery config - http://owlgraphic.com/owlcarousel/#customizing*/
		_owlCarousell = function() {
			if($(galleryClass).length) {
				$(galleryClass).each(function() {
					$(this).owlCarousel({
						autoPlay: 5000,
						stopOnHover: true,
						itemsScaleUp: true
					});
				});
			}
		},
		/* image popup config - http://dimsemenov.com/plugins/magnific-popup/documentation.html*/
		_magnificPopup = function() {
			var mfOptions = {
				type: 'image',
				removalDelay: 500,
				midClick: true,
				callbacks: {
					beforeOpen: function() {
						this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
						this.st.mainClass = 'mfp-zoom-in';
						/* other css animations: http://codepen.io/dimsemenov/pen/GAIkt */
					}
				},
				fixedContentPos: false,
				closeOnContentClick: true,
				gallery:{
					enabled: true
				}
			};
			if($('.filtered').length) {
				$(imagePopupClassFiltered).magnificPopup(mfOptions);
			} else if($(imagePopupClass).length) {
				$(imagePopupClass).magnificPopup(mfOptions);
			}
		},
		/* gmaps styled extension */
		/* from: http://www.igloolab.com/downloads/Serioli/GMaps/styledMaps.html */
		_gmapsStyled = function() {
			GMaps.prototype.addStyle = function(options){
				var styledMapType = new google.maps.StyledMapType(options.styles, options.styledMapName);
				this.map.mapTypes.set(options.mapTypeId, styledMapType);
			};
			GMaps.prototype.setStyle = function(mapTypeId){
				this.map.setMapTypeId(mapTypeId);
			};
		},
		/* google maps config - simple helper but you can use http://hpneo.github.io/gmaps/examples.html
		finding places lat and lng params : http://universimmedia.pagesperso-orange.fr/geo/loc.htm */
		_gmaps = function() {
			var mapId, mapLat, mapLng, mapZoom;
			if($(gMapsClass).length) {
				$(gMapsClass).each(function(){
					mapId = $(this).prop('id');
					mapLat = $(this).data('lat');
					mapLng = $(this).data('lng');
					mapZoom = $(this).data('zoom');
					var map = new GMaps({
						div: '#'+mapId,
						lat: mapLat,
						lng: mapLng,
						zoom: mapZoom
					});
					/* for map styles check out: gmaps-styles.js file (all from http://snazzymaps.com/) change mstyles variable */
					var mstyles = subtle_grayscale;
					map.addStyle({
						styledMapName: 'Styled Map',
						styles: mstyles,
						mapTypeId: 'map_style'
					});
					map.setStyle("map_style");
				});
			}
		},
		_goToTop = function() {
			if($(backToTopButton).length) {
				$(window).scroll(function () {
					if ($(this).scrollTop() > 300) {
						$(backToTopButton).removeClass('hidden');
					} else {
						$(backToTopButton).addClass('hidden');
					}
				});
				$(backToTopButton).on('click', function () {
					$('body,html').animate({
						scrollTop: 0
					}, 800);
				});
			}
		},
		_sortScroll = function() {
			if($(window).width() < 1120) {
				$('html, body').stop(true, false).animate({
					scrollTop: $(indexGridId).offset().top
				}, 'slow', 'linear');
			}
		},
		// unic array tool
	    _unicArray = function (array) {
	        return $.grep(array, function(el, index) {
	            return index === $.inArray(el, array);
	        });
	    },
		// prepare all existing filters in visible posts on index page
	    _prepareShuffleFilters = function () {
            var $postItem = $('.artee-index-post');
            var $tagsList = $('.artee-sort-groups-options.auto-load-tags');
            var tags = [];
            var firstItem;
            var activeTag;
            if ($postItem.length) {
                $postItem.each(function () {
                    tags = tags.concat($(this).data('tags').split(','));
                });
                tags = _unicArray(tags).filter(Boolean);
            }
            if ($tagsList.find('a.active').length && $tagsList.find('a.active').data('option') !== '') {
            	firstItem = '<li><a href="#" data-option="">All</a></li>';
            	activeTag = $tagsList.find('a.active').text();
            } else {
            	firstItem = '<li><a href="#" class="active" data-option="">All</a></li>';
            }
			$tagsList.empty();
			$tagsList.append(firstItem);
            tags.forEach(function (tag) {
            	if (activeTag === tag) {
                	$tagsList.append('<li><a href="#" class="active" data-option="' + tag + '">' + tag + '</a></li>');
            	} else {
                	$tagsList.append('<li><a href="#" data-option="' + tag + '">' + tag + '</a></li>');
            	}
            });
            if ($tagsList.outerWidth() > 750) {
            	$tagsList.closest('.artee-index-sort').addClass('dropdown-sorter');
            	$('.chosen-filer').text($tagsList.find('a.active').text());
            }
	    },
		_shuffleGrid = function() {
			imagesLoaded(indexImageContainer, function() {
				var $indexGrid = $(indexGridId).shuffle({
					itemSelector: siteContentPost
				});
				if($(siteIndexShuffleSelect).length) {
					$(siteIndexShuffleSelect).on('click', 'li > a', function(e) {
						e.preventDefault();
						if ($('.dropdown-sorter').length) {
							$('.artee-sort-groups-options').removeClass('active');
							$('.chosen-filer').text($(this).text());
						}
						var shuffle = $(this).data('option');
						$(siteIndexShuffleSelect).find('li > a').removeClass('active');
						$(this).addClass('active');
						$indexGrid.shuffle('shuffle', shuffle);
						_sortScroll();
						_magnificPopup();
					});
				}
				if($(siteIndexSortSelect).length) {
					$(siteIndexSortSelect).find('li > a').on('click', function(e) {
						e.preventDefault();
						var sort = $(this).data('option'),
							opts = {};
						$(siteIndexSortSelect).find('li > a').removeClass('active');
						$(this).addClass('active');
						if (sort === 'title-asc') {
							opts = {
								by: function($el) {
									return $el.data('title').toLowerCase();
								}
							};
						} else if (sort === 'title-desc') {
							opts = {
								reverse: true,
								by: function($el) {
									return $el.data('title').toLowerCase();
								}
							};
						}
						// Filter elements
						$indexGrid.shuffle('sort', opts);
						_sortScroll();
						_magnificPopup();
					});
				}
				/* load more articles and shuffle */
				if($(loadMoreButton).length) {
					$(loadMoreButton).on('click', function(e){
						e.preventDefault();
						_loadMorePostsPrepare($indexGrid);
					});
				}
			});
		},
		_loadMoreButtonOnStart = function() {
			if($(olderPostsClass).length < 1) {
				$(loadMoreButton).text('No more articles').addClass('no-more-data');
			}
		},
		_loadMorePostsPrepare = function($indexGrid) {
			var olderPostsHref = $(olderPostsClass).attr('href'),
				articlesLoaded, moreArticles, artItems = [];
			if(olderPostsHref !== undefined) {
				$.get(olderPostsHref, function(data) {
					articlesLoaded = $(articleIndexGridId, data);
					moreArticles = $(olderPostsClass, data);
					articlesLoaded.find('article').each(function(){
						artItems.push(this);
					});
					$(indexGridId).append(articlesLoaded.contents());
					imagesLoaded(indexImageContainer, function() {
						$indexGrid.shuffle('appended', $(artItems), false, false);
						if(moreArticles.attr('href') !== undefined) {
							$(olderPostsClass).attr('href', moreArticles.attr('href'));
						} else {
							$(olderPostsClass).remove();
							$(loadMoreButton).text('No more articles').addClass('no-more-data');
						}
						_prepareShuffleFilters();
						_indexPostImageHover();
						_magnificPopup();
					});
				});
			}
		},
		_indexPostImageHover = function() {
			if($(indexImageContainer).length) {
				$(indexImageContainer).find('iframe').each(function(){
					$(this).closest(indexImageContainer).find(indexImageOverlay).remove();
				});
				$(indexImageContainer).find(galleryClass).each(function(){
					$(this).closest(indexImageContainer).find(indexImageOverlay).remove();
				});
				$(indexImageContainer).find('p img:not('+ galleryClass +' img, .orbit-container img, '+ twentyTwenty +' img)').each(function(){
					var imageURL = $(this).prop('src'),
						artURL = $(this).closest(siteContentPost).find('.artee-index-post-title').find('a').attr('href');
					$(this).wrap('<a href="'+artURL+'"/>');
					$(this).closest(indexImageContainer).find('.zoom-icon').attr({'href': imageURL}).addClass('artee-image-popup');
				});
				$(indexImageContainer).on('mouseenter', function() {
					$(indexImageOverlay, this).addClass('hovered');
				});
				$(indexImageContainer).on('mouseleave', function() {
					$(indexImageOverlay, this).removeClass('hovered');
				});
			}
		},
		_twentyTwenty = function() {
			if($(twentyTwenty).length) {
				imagesLoaded(twentyTwenty, function(){
					$(twentyTwenty).each(function(){
						$(this).twentytwenty();
					});
				});
			}
		},
		_mobileMenu = function() {
			if($(mainMenu).length) {
				$(mobileMenuButton).on('click', function(e){
					e.preventDefault();
					$(mainMenu).addClass('opened');
				});
				$(mobileMenuCloseButton).on('click', function(e){
					e.preventDefault();
					$(mainMenu).removeClass('opened');
				});
			}
		},
		_tooWideSorterMenu = function () {
			$('.artee-index-sort').on('click', '.artee-too-wide-sort', function () {
				$('.artee-sort-groups-options').toggleClass('active');
			});
		},
		_sortMenu = function() {
			if($(sortMenus).length) {
				$(sortMobileActivator).on('click', function(){
					$(sortMenus).slideToggle();
				});
			}
		},
		_bodyFixed = function() {
			if($('html[data-useragent*="Android 4.4"]').length) {
				var bgURL = $('.artee-body-background').attr('style');
				$('body').attr('style',bgURL);
				$('.artee-body-background').removeAttr('style');
			}
		},
		_headroom = function () {
	        $('.headroom').headroom({
	            offset: 200,
	            classes : {
	                pinned : '',
	                unpinned : ''
	            }
	        });
	    },
	    _searchModule = function () {
	        var $openSearchBtn = $('.js-open-search');
	        var $closeSearchBtn = $('.js-close-search');
	        var $bigSearchContainer = $('.big-search');
	        // ghost hunter init
	        var ghostHunter = $('.js-search-input').ghostHunter({
	            results: '.js-search-results',
	            result_template: '<a href="{{link}}"><p><h2><i class="fa fa-fw fa-dot-circle-o"></i> {{title}}</h2></p></a>',
	            onKeyUp: true,
	            rss: '/rss/'
	        });
	        $openSearchBtn.on('click', function (e) {
	            e.preventDefault();
	            $bigSearchContainer.addClass('open');
	            $(window).scrollTop(0);
	            $bigSearchContainer.find('input[type=text]').focus();
	        });
	        $closeSearchBtn.on('click', function (e) {
	            e.preventDefault();
	            ghostHunter.clear();
	            $bigSearchContainer.removeClass('open');
	        });
	    },
	    // based on : 'Reading Position Indicator' article
        // http://css-tricks.com/reading-position-indicator/
        _positionIndicator = function () {
            if ($('.js-post-reading-time').is(':visible')) {
                imagesLoaded('.artee-post-content', function () {
                    var getMax = function() {
                        return $('.artee-post-content').height();
                    };
                    var getValue = function() {
                        return $(window).scrollTop();
                    };
                    var progressBar, max, value, width, percent;
                    if('max' in document.createElement('progress')){
                        // Browser supports progress element
                        progressBar = $('progress');
                        // Set the Max attr for the first time
                        progressBar.attr({ max: getMax() });
                        $(document).on('scroll', function(){
                            // On scroll only Value attr needs to be calculated
                            progressBar.attr({ value: getValue() });
                            percent = Math.floor((getValue() / getMax()) * 100) - 5;
                            if (percent < 0) {
                                percent = 0;
                                $('.js-post-sticky-footer').removeClass('visible');
                                $(backToTopButton).addClass('end-of-post');
                            } else if (percent > 100) {
                                percent = 100;
                                $('.js-post-sticky-footer').removeClass('visible');
                                $(backToTopButton).addClass('end-of-post');
                            } else {
                                $('.js-post-sticky-footer').addClass('visible');
                                $(backToTopButton).removeClass('end-of-post');
                            }
                            $('.js-percent-count').text(percent + '%');
                        });
                        $(window).resize(function(){
                            // On resize, both Max/Value attr needs to be calculated
                            progressBar.attr({ max: getMax(), value: getValue() });
                        });
                    }
                    else {
                        progressBar = $('.progress-bar'),
                            max = getMax(),
                            value, width;
                        var getWidth = function(){
                            // Calculate width in percentage
                            value = getValue();
                            width = (value/max) * 100;
                            width = width + '%';
                            return width;
                        };
                        var setWidth = function(){
                            progressBar.css({ width: getWidth() });
                            $('.js-percent-count').text(getWidth());
                        };
                        $(document).on('scroll', setWidth);
                        $(window).on('resize', function(){
                            // Need to reset the Max attr
                            max = getMax();
                            setWidth();
                        });
                    }
                });
            }
        },

        _readingTime = function () {
            var $postArticleContent = $('.artee-post-content');
            if ($postArticleContent.length) {
                $postArticleContent.readingTime({
                    wordCountTarget: $('.js-post-reading-time').find('.js-word-count')
                });
            }
        };

	return {
		/* artee theme initialization */
		init: function() {
			$(document).foundation();
			_userAgentInit();
			_twentyTwenty();
			_mobileMenu();
			_sortMenu();
			_owlCarousell();
			_indexPostImageHover();
			_gmapsStyled();
			_gmaps();
			_goToTop();
			_prepareShuffleFilters();
			_tooWideSorterMenu();
			_shuffleGrid();
			_magnificPopup();
			_loadMoreButtonOnStart();
			_headroom();
			_searchModule();
			_positionIndicator();
			_readingTime();
			_bodyFixed();
		}
	};

})(jQuery);

/* artee Theme javascripts initialization */
(function() {

	'use strict';
	artee.init();

})();