'use strict';

(function() {
    /* ----------------------------------------
    Exposed Variables
    ---------------------------------------- */
    var documentBody = $(document.body);
    var mainView = $('html, body');
    var msBrowserRegex = /MSIE|Edge|Trident/;
    var mobileRegex = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i;
    var userAgentString = navigator.userAgent;
    var isMobile = false;
    var loading;

    if (mobileRegex.test(userAgentString)) {
        isMobile = true;

        documentBody.addClass('mobile');
    }

    if (msBrowserRegex.test(userAgentString)) documentBody.addClass('ms-browser');;

    /* ----------------------------------------
    Page Refresh Functions
    ---------------------------------------- */
    $(document).ready(function() {
        var contactLink = $('.contact-link');
        var contactClicked = false;

        mainView.scrollTop(0);

        contactLink.click(function() {
            contactClicked = true;
        });

        $(window).on('beforeunload unload pagehide', function() {
            if (!contactClicked) { // Ignore event if contact button is clicked
                mainView.scrollTop(0);
                documentBody.hide();
            } else contactClicked = false; // Reset
        });
    });

    /* ----------------------------------------
    Page Load Functions
    ---------------------------------------- */
    $(document).ready(function() {
        var portfolioImages = $('#portfolio li a img');
        var mainContainer = $('main');
        var heroRegion = $('#hero');
        var heroContainer = $('#hero .container');
        var intro = $('.intro');
        var introSlideIn = $('.slide-in');
        var footer = $('footer');

        loading = $('#loading');

        function randomInteger(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        function endAnimationSequence() {
            intro.addClass('loaded');
            mainContainer.addClass('loaded');
            footer.addClass('reveal');
        }

        function slideInIntroContent() {
            introSlideIn.addClass('reveal');
            setTimeout(endAnimationSequence, 500);
        };

        function revealHeroAndIntro() {
            heroRegion.addClass('reveal');
            intro.addClass('reveal');
            setTimeout(slideInIntroContent, 250);
        };

        if (window.matchMedia('(max-width: 740px)').matches) {
            mainContainer.addClass('loaded');
            footer.addClass('reveal');
        } else loading.addClass('active');

        $(window).load(function() {
            loading.removeClass('active');

            setTimeout(function() {
                heroContainer.removeClass('closed');
                setTimeout(revealHeroAndIntro, 500);
            }, 1000);

            portfolioImages.each(function() {
                var theImage = $(this);

                setTimeout(function() {
                    var theProject = theImage.closest('li');

                    theProject.addClass('loaded');
                }, randomInteger(250, 750));
            });
        });
    });

    /* ----------------------------------------
    Filter Functions
    ---------------------------------------- */
    $(document).ready(function() {
        var portfolio = $('#portfolio');
        var dropDown = $('.drop-down');
        var dropDownOptions = $('.options');
        var dropDownOptionsItem = $('.options li');
        var dropDownSelected = $('#selected');
        var markup = $('html');

        portfolio.isotope({ // Isotope initialize
            itemSelector: '.project',
            layoutMode: 'fitRows',
            transitionDuration: '0.25s'
        });

        function filterPortfolio(className) {
            if (className === 'all') portfolio.isotope({ filter: '*' });
            else portfolio.isotope({ filter: '.' + className });
        }

        dropDown.click(function(e) {
            e.stopPropagation();
            dropDownOptions.toggleClass('open');
        });

        dropDownOptionsItem.click(function() {
            var theOption = $(this).attr('class');
            var theContent = $(this).html();

            dropDownSelected.html(theContent);
            filterPortfolio(theOption)
        });

        markup.click(function() {
            if (dropDownOptions.hasClass('open')) dropDownOptions.removeClass('open');
        });
    });

    /* ----------------------------------------
    Portfolio Functions
    ---------------------------------------- */
    $(document).ready(function() {
            var header = $('header');
            var portfolioItem = $('#portfolio li a');
            var projectContainer = $('#project');
            var hashValue = window.location.hash;

        function initPlugins() {
            if (!$('.lSSlideOuter').length) {
                $('#project .project-content .images ul').lightSlider({ // LightSlider initialize
                    adaptiveHeight: true,
                    speed: 250,
                    item: 1,
                    slideMargin: 15,
                    loop: true,
                    pager: true,
                    galleryMargin: 30,
                    keyPress: true
                });
            }
        }

        function closeHeader(closeButton, handleKeyup, loading, header, projectHero, projectContent) {
            var emptyContainer = function() {
                projectContainer.empty();
            };

            header.animate({
                scrollTop: 0,
                easing: 'ease',
            }, 250)
                .one('transitionend', emptyContainer)
                .removeClass('open');

            documentBody.removeClass('disable-scroll');
            closeButton.unbind('click');
            $(document).unbind('keyup', handleKeyup);
            loading.removeClass('active');	
            projectHero.removeClass('active');
            projectContent.removeClass('active');
        }

        function revealProject(loading, projectHero, projectContent) {
            setTimeout(function() { // Fixes transition cancel
                loading.removeClass('active');
                projectContent.addClass('active');

                setTimeout(function() {
                    projectHero.addClass('active');
                }, 100);
            }, 100);
        }

        function initProject() {
            var projectMedia = $('#project img, #project iframe');
            var projectHero = $('.project-hero');
            var projectContent = $('.project-content');
            var closeButton = $('#close-btn');
            var handleKeyup = function(e) {
                if (e.which === 27 && projectHero.hasClass('active')) closeHeader(closeButton, handleKeyup, loading, header, projectHero, projectContent); // If Esc key is pressed on loaded project
            };

            $.when(initPlugins()).done(function() {
                var loadCount = 0;
                var totalCount = projectMedia.length;

                if (totalCount === 0) revealProject(loading, projectHero, projectContent);
                else {
                    projectMedia.load(function() {
                        loadCount++;
                        if (loadCount >= totalCount) revealProject(loading, projectHero, projectContent);
                    });
                }
            });

            closeButton.click(function(e) {
                e.preventDefault();
                closeHeader(closeButton, handleKeyup, loading, header, projectHero, projectContent);
            });

            header.click(function(e) {
                if (e.target === this && projectHero.hasClass('active')) closeHeader(closeButton, handleKeyup, loading, header, projectHero, projectContent); // If clicked outside of loaded project
            });

            $(document).keyup(handleKeyup);
        }

        function requestFiles(project) {
            loading.addClass('active');

            var request = $.ajax({
                    url: 'projects/' + project + '.html',
                    success: function(data) {
                        projectContainer.html(data);
                        initProject();
                    },
                    error: function() {
                        requestFiles('not-found');
                    }
                });

            var handleLoadingKeyup = function(e) {
                    if (e.which === 27) { // If Esc key is pressed while loading project
                        request.abort();
                        $(document).unbind('keyup', handleLoadingKeyup);
                        documentBody.removeClass('disable-scroll');
                        loading.removeClass('active');
                        header.removeClass('open');
                        projectContainer.empty();
                    }
                }

            $(document).one('keyup', handleLoadingKeyup);
        }

        function getProject(projectPath) {
            var project = projectPath.replace(/[\/,#,!]/g, '');

            documentBody.addClass('disable-scroll');
            header.one('transitionend', function() {
                requestFiles(project);
            })
                .addClass('open');
        }

        if (hashValue) $(window).load(getProject(hashValue)); // If URL has anchor

        portfolioItem.click(function(e) {
            var projectPath = $(this).attr('href');

            e.preventDefault();
            getProject(projectPath);
        });

        documentBody.on('click', '#info-btn', function(e) {
            e.preventDefault();
            $(this).toggleClass('active');
            $('.project-content .notes').stop()
                .slideToggle(150);
        });
    });

    /* ----------------------------------------
    Logo Functions
    ---------------------------------------- */
    $(document).ready(function() {
        var logo = $('.logo');

        logo.click(function() {
            mainView.animate({
                scrollTop: 0
            }, 500);
        });
    });

    /* ----------------------------------------
    Copyright Year Functions
    ---------------------------------------- */
    $(document).ready(function() {
        var copyrightYear = $('.copyright-year');
        var currentYear = new Date().getFullYear();

        copyrightYear.text(currentYear);
    });

    /* ----------------------------------------
    Mobile Menu Functions
    ---------------------------------------- */
    $(document).ready(function() {
        var mobileMenu = $('.mobile-menu');
        var switchingContent = $('header h1, header nav');

        mobileMenu.click(function() {
            mobileMenu.toggleClass('active');
            switchingContent.toggleClass('switch');
        });
    });

    /* ----------------------------------------
    Object Fit Polyfill
    ---------------------------------------- */
    $(document).ready(function() {
        if (typeof(document.documentElement.style.objectFit) === 'undefined') $('.background-cover').backgroundCover();
    });
})();