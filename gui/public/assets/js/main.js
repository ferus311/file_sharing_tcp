/*-----------------------------------------------------------------

Template Name: NetShare - Hosting HTML5Template
Author:  ex-coders
Author URI: https://themeforest.net/user/ex-coders/portfolio
Version: 1.0.0
Description: NetShare - Hosting HTML5Template<

-------------------------------------------------------------------
CSS TABLE OF CONTENTS
-------------------------------------------------------------------

01. header
02. animated text with swiper slider
03. magnificPopup
04. counter up
05. wow animation
06. nice select
07. swiper slider
08. search popup
09. mousecursor
09. preloader


------------------------------------------------------------------*/

(function ($) {
    'use strict';

    $(document).ready(function () {
        //>> Mobile Menu Js Start <<//
        $('#mobile-menu').meanmenu({
            meanMenuContainer: '.mobile-menu',
            meanScreenWidth: '1199',
            meanExpand: ['<i class="far fa-plus"></i>'],
        });

        //>> Sidebar Toggle Js Start <<//
        $('.offcanvas__close,.offcanvas__overlay').on('click', function () {
            $('.offcanvas__info').removeClass('info-open');
            $('.offcanvas__overlay').removeClass('overlay-open');
        });
        $('.sidebar__toggle').on('click', function () {
            $('.offcanvas__info').addClass('info-open');
            $('.offcanvas__overlay').addClass('overlay-open');
        });

        //>> Body Overlay Js Start <<//
        $('.body-overlay').on('click', function () {
            $('.offcanvas__area').removeClass('offcanvas-opened');
            $('.df-search-area').removeClass('opened');
            $('.body-overlay').removeClass('opened');
        });

        //>> Sticky Header Js Start <<//

        $(window).scroll(function () {
            if ($(this).scrollTop() > 250) {
                $('#header-sticky').addClass('sticky');
            } else {
                $('#header-sticky').removeClass('sticky');
            }
        });

        //>> Video Popup Start <<//
        $('.img-popup').magnificPopup({
            type: 'image',
            gallery: {
                enabled: true,
            },
        });

        $('.video-popup').magnificPopup({
            type: 'iframe',
            callbacks: {},
        });

        //>> Counterup Start <<//
        $('.count').counterUp({
            delay: 15,
            time: 4000,
        });

        //>> Wow Animation Start <<//
        new WOW().init();

        //>> Nice Select Start <<//
        $('select').niceSelect();

        //>> Brand Slider Start <<//
        if ($('.brand-slider').length > 0) {
            const brandSlider = new Swiper('.brand-slider', {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 6,
                    },
                    991: {
                        slidesPerView: 5,
                    },
                    767: {
                        slidesPerView: 4,
                    },
                    575: {
                        slidesPerView: 3,
                    },
                    400: {
                        slidesPerView: 2,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                },
            });
        }

        if ($('.brand-slider-2').length > 0) {
            const brandSlider2 = new Swiper('.brand-slider-2', {
                spaceBetween: 20,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 5,
                    },
                    991: {
                        slidesPerView: 4,
                    },
                    767: {
                        slidesPerView: 3,
                    },
                    575: {
                        slidesPerView: 3,
                    },
                    400: {
                        slidesPerView: 2,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                },
            });
        }

        //>> Testimonial Slider Start <<//
        if ($('.testimonial-slider').length > 0) {
            const testimonialSlider = new Swiper('.testimonial-slider', {
                spaceBetween: 20,
                speed: 3000,
                loop: true,
                centeredSlides: true,
                autoplay: {
                    delay: 2000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.dot',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.array-prev',
                    prevEl: '.array-next',
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 3,
                    },
                    991: {
                        slidesPerView: 2,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 1,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                },
            });
        }

        if ($('.testimonial-slider-2').length > 0) {
            const testimonialSlider2 = new Swiper('.testimonial-slider-2', {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '.array-prev',
                    prevEl: '.array-next',
                },
            });
        }

        //>> Team Slider Start <<//
        if ($('.team-slider').length > 0) {
            const teamSlider = new Swiper('.team-slider', {
                spaceBetween: 30,
                speed: 3000,
                loop: true,
                autoplay: {
                    delay: 2000,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '.array-prev',
                    prevEl: '.array-next',
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 4,
                    },
                    991: {
                        slidesPerView: 3,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 1,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                },
            });
        }

        //>> CountDown Start <<//
        let targetDate = new Date('2024-07-12 00:00:00').getTime();
        const countdownInterval = setInterval(function () {
            let currentDate = new Date().getTime();
            let remainingTime = targetDate - currentDate;

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                // Display a message or perform any action when the countdown timer reaches zero
                $('#countdown-container').text('Countdown has ended!');
            } else {
                let days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
                let hours = Math.floor(
                    (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                let minutes = Math.floor(
                    (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
                );
                let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

                // Pad single-digit values with leading zeros
                $('#day').text(days.toString().padStart(2, '0'));
                $('#hour').text(hours.toString().padStart(2, '0'));
                $('#min').text(minutes.toString().padStart(2, '0'));
                $('#sec').text(seconds.toString().padStart(2, '0'));
            }
        }, 1000);

        //>> Search Popup Start <<//
        const $searchWrap = $('.search-wrap');
        const $navSearch = $('.nav-search');
        const $searchClose = $('#search-close');

        $('.search-trigger').on('click', function (e) {
            e.preventDefault();
            $searchWrap.animate({ opacity: 'toggle' }, 500);
            $navSearch.add($searchClose).addClass('open');
        });

        $('.search-close').on('click', function (e) {
            e.preventDefault();
            $searchWrap.animate({ opacity: 'toggle' }, 500);
            $navSearch.add($searchClose).removeClass('open');
        });

        function closeSearch() {
            $searchWrap.fadeOut(200);
            $navSearch.add($searchClose).removeClass('open');
        }

        $(document.body).on('click', function (e) {
            closeSearch();
        });

        $('.search-trigger, .main-search-input').on('click', function (e) {
            e.stopPropagation();
        });

        //>> Mouse Cursor Start <<//
    }); // End Document Ready Function

    function loader() {
        $(window).on('load', function () {
            // Animate loader off screen
            $('.preloader').addClass('loaded');
            $('.preloader').delay(600).fadeOut();
        });
    }

    loader();
})(jQuery); // End jQuery
