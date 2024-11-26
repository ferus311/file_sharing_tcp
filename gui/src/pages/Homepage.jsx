const Homepage = () => {

    return (
        <div>
            <div class="mouse-cursor cursor-outer"></div>
            <div class="mouse-cursor cursor-inner"></div>

            <div class="fix-area">
                <div class="offcanvas__info">
                    <div class="offcanvas__wrapper">
                        <div class="offcanvas__content">
                            <div class="offcanvas__top mb-5 d-flex justify-content-between align-items-center">
                                <div class="offcanvas__logo">
                                    <a href="index.html">
                                        <img src="assets/img/logo/black-logo.svg" alt="logo-img" />
                                    </a>
                                </div>
                                <div class="offcanvas__close">
                                    <button>
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="text d-none d-xl-block">
                                Nullam dignissim, ante scelerisque the is euismod fermentum odio sem semper the is erat, a
                                feugiat leo urna eget eros. Duis Aenean a imperdiet risus.
                            </p>
                            <div class="mobile-menu fix mb-3"></div>
                            <div class="offcanvas__contact">
                                <h4>Contact Info</h4>
                                <ul>
                                    <li class="d-flex align-items-center">
                                        <div class="offcanvas__contact-icon">
                                            <i class="fal fa-map-marker-alt"></i>
                                        </div>
                                        <div class="offcanvas__contact-text">
                                            <a target="_blank" href="news-grid.html#">Main Street, Melbourne, Australia</a>
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-center">
                                        <div class="offcanvas__contact-icon mr-15">
                                            <i class="fal fa-envelope"></i>
                                        </div>
                                        <div class="offcanvas__contact-text">
                                            <a href="mailto:info@example.com"><span
                                                class="mailto:info@example.com">info@example.com</span></a>
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-center">
                                        <div class="offcanvas__contact-icon mr-15">
                                            <i class="fal fa-clock"></i>
                                        </div>
                                        <div class="offcanvas__contact-text">
                                            <a target="_blank" href="news-grid.html#">Mod-friday, 09am -05pm</a>
                                        </div>
                                    </li>
                                    <li class="d-flex align-items-center">
                                        <div class="offcanvas__contact-icon mr-15">
                                            <i class="far fa-phone"></i>
                                        </div>
                                        <div class="offcanvas__contact-text">
                                            <a href="tel:+11002345909">+11002345909</a>
                                        </div>
                                    </li>
                                </ul>
                                <div class="header-button mt-4">
                                    <a href="contact.html" class="theme-btn text-center">
                                        Get A Quote <i class="fa-solid fa-arrow-right-long"></i>
                                    </a>
                                </div>
                                <div class="social-icon d-flex align-items-center">
                                    <a href="news-grid.html#"><i class="fab fa-facebook-f"></i></a>
                                    <a href="news-grid.html#"><i class="fab fa-twitter"></i></a>
                                    <a href="news-grid.html#"><i class="fab fa-youtube"></i></a>
                                    <a href="news-grid.html#"><i class="fab fa-linkedin-in"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="offcanvas__overlay"></div>

            <header class="header-section-1">
                <div class="header-top">
                    <div class="container">
                        <div class="header-top-wrapper">
                            <ul class="contact-list">
                                <li>
                                    <i class="far fa-envelope"></i>
                                    <a href="mailto:info@example.com">info@example.com</a>
                                </li>
                                <li>
                                    <i class="fa-regular fa-phone"></i>
                                    <a href="tel:+20866660112">+208-6666-0112</a>
                                </li>
                            </ul>
                            <p>ClueHost Flash Discount: Starting at <b>$3.49/mo</b> for a Limited time</p>
                            <ul class="list">
                                <li><i class="fa-light fa-comments"></i><a href="contact.html">Live Chat</a></li>
                                <li><i class="fa-light fa-user"></i>
                                    <button data-bs-toggle="modal" data-bs-target="#exampleModal2">
                                        Login
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div id="header-sticky" class="header-1">
                    <div class="container">
                        <div class="mega-menu-wrapper">
                            <div class="header-main">
                                <div class="header-left">
                                    <div class="logo">
                                        <a href="index.html" class="header-logo">
                                            <img src="assets/img/logo/white-logo.svg" alt="logo-img" />
                                        </a>
                                        <a href="index.html" class="header-logo-2">
                                            <img src="assets/img/logo/black-logo.svg" alt="logo-img" />
                                        </a>
                                    </div>
                                </div>
                                <div class="header-right d-flex justify-content-end align-items-center">
                                    <div class="mean__menu-wrapper">
                                        <div class="main-menu">
                                            <nav id="mobile-menu">
                                                <ul>
                                                    <li class="has-dropdown active menu-thumb">
                                                        <a href="index.html">
                                                            Home
                                                        </a>
                                                    </li>
                                                    <li class="has-dropdown active">
                                                        <a href="team.html" class="border-none">
                                                            Pages
                                                            <i class="fas fa-angle-down"></i>
                                                        </a>
                                                        <ul class="submenu">
                                                            <li><a href="about.html">About Us</a></li>
                                                            <li><a href="affiliate.html">Affiliate</a></li>
                                                            <li><a href="pricing.html">Pricing</a></li>
                                                            <li><a href="pricing-2.html">Pricing Package</a></li>
                                                            <li><a href="data-center.html">Data Center</a></li>
                                                            <li><a href="service.html">Services</a></li>
                                                            <li><a href="404.html">Error Pages</a></li>
                                                        </ul>
                                                    </li>
                                                    <li class="has-dropdown active">
                                                        <a href="team.html" class="border-none">
                                                            Hosting
                                                            <i class="fas fa-angle-down"></i>
                                                        </a>
                                                        <ul class="submenu">
                                                            <li><a href="share-hosting.html">Share Hosting</a></li>
                                                            <li><a href="reseller-hosting.html">Reseller Hosting</a></li>
                                                            <li><a href="dedicated-hosting.html">Dedicated Hosting</a></li>
                                                            <li><a href="vps-hosting.html">VPS Hosting</a></li>
                                                            <li><a href="wordpress-hosting.html">WordPress Hosting</a></li>
                                                            <li><a href="cloud-hosting.html">Cloud Hosting</a></li>
                                                        </ul>
                                                    </li>
                                                    <li>
                                                        <a href="doming.html">Doming</a>
                                                    </li>
                                                    <li>
                                                        <a href="news.html">
                                                            News
                                                            <i class="fas fa-angle-down"></i>
                                                        </a>
                                                        <ul class="submenu">
                                                            <li><a href="news-grid.html">News Grid</a></li>
                                                            <li><a href="news.html">News List</a></li>
                                                            <li><a href="news-details.html">News Details</a></li>
                                                        </ul>
                                                    </li>
                                                    <li>
                                                        <a href="contact.html">
                                                            Help Center
                                                            <i class="fas fa-angle-down"></i>
                                                        </a>
                                                        <ul class="submenu">
                                                            <li><a href="faq.html">Faq</a></li>
                                                            <li><a href="404.html">Error 404</a></li>
                                                            <li><a href="support.html">Support</a></li>
                                                            <li><a href="contact.html">Contact Us</a></li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                    <a href="news-grid.html#0" class="search-trigger search-icon"><i
                                        class="fal fa-search"></i></a>
                                    <div class="header__hamburger d-xl-block my-auto">
                                        <div class="sidebar__toggle">
                                            <i class="fas fa-bars"></i>
                                        </div>
                                    </div>
                                    <div class="header-button">
                                        <a href="contact.html" class="theme-btn">
                                            get Started
                                            <i class="fa-solid fa-arrow-right-long"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div class="modal modal-common-wrap fade" id="exampleModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body d-md-flex d-grid gap-md-0 gap-5 align-items-center">
                            <div class="modal-common-content">
                                <div class="box">
                                    <h2>
                                        welcome back!
                                    </h2>
                                    <form action="news-grid.html#" class="login-from">
                                        <div class="form-grp cmn-mb">
                                            <input type="email" placeholder="Email Address" />
                                        </div>
                                        <div class="form-grp">
                                            <input type="text" placeholder="Enter Password" />
                                        </div>
                                        <div
                                            class="d-flex forgot-inner-area cmn-mb justify-content-between gap-2 flex-wrap align-items-center">
                                            <div class="form-check checkmark-inner">
                                                <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked"
                                                    checked />
                                                <label class="form-check-label" for="flexCheckChecked">
                                                    Remember me
                                                </label>
                                            </div>
                                            <a href="news-grid.html#" class="forgot">
                                                Forgot Your password?
                                            </a>
                                        </div>
                                        <button type="button" class="theme-btn w-100">
                                            <span>
                                                Log in
                                            </span>
                                        </button>
                                    </form>
                                    <span class="orting-badge">
                                        Or
                                    </span>
                                    <div class="d-grid gap-3">
                                        <a href="news-grid.html#" class="cmn-social">
                                            <img src="assets/img/sign/google.png" alt="img" />
                                            Continue With Google
                                        </a>
                                        <a href="news-grid.html#" class="cmn-social">
                                            <img src="assets/img/sign/fb.png" alt="img" />
                                            continue with facebook
                                        </a>
                                    </div>
                                    <div class="form-check d-flex align-items-center gap-2 from-customradio">
                                        <input class="form-check-input" type="radio" name="flexRadioDefault"
                                            id="flexRadioDefault1" />
                                        <label class="form-check-label" for="flexRadioDefault1">
                                            i accept your terms & conditions
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-right-thumb position-relative">
                                <img src="assets/img/sign/login.png" alt="img" />
                                <div class="signlogin-btnwrap">
                                    <button class="theme-create style-border" data-bs-toggle="modal"
                                        data-bs-target="#exampleModal">
                                        create account
                                    </button>
                                    <button class="theme-btn" data-bs-toggle="modal" data-bs-target="#exampleModal2">
                                        Log In
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal modal-common-wrap fade" id="exampleModal2" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body d-md-flex d-grid gap-md-0 gap-5 align-items-center">
                            <div class="modal-common-content">
                                <div class="box">
                                    <h2>
                                        Create account
                                    </h2>
                                    <form action="news-grid.html#" class="login-from">
                                        <div class="form-grp cmn-mb">
                                            <input type="text" placeholder="User name" />
                                        </div>
                                        <div class="form-grp cmn-mb">
                                            <input type="email" placeholder="Email Address" />
                                        </div>
                                        <div class="form-grp cmn-mb">
                                            <input type="text" placeholder="Enter Password" />
                                        </div>
                                        <div class="form-grp">
                                            <input type="text" placeholder="Enter Confirm password" />
                                        </div>
                                    </form>
                                    <span class="orting-badge">
                                        Or
                                    </span>
                                    <div class="d-grid gap-3">
                                        <a href="news-grid.html#" class="cmn-social">
                                            <img src="assets/img/sign/google.png" alt="img" />
                                            Continue With Google
                                        </a>
                                        <a href="news-grid.html#" class="cmn-social">
                                            <img src="assets/img/sign/fb.png" alt="img" />
                                            continue with facebook
                                        </a>
                                    </div>
                                    <div class="pb-xxl-3">
                                        <div class="form-check d-flex align-items-center gap-2 from-customradio">
                                            <input class="form-check-input" type="radio" name="flexRadioDefault"
                                                id="flexRadioDefault11" />
                                            <label class="form-check-label" for="flexRadioDefault11">
                                                i accept your terms & conditions
                                            </label>
                                        </div>
                                    </div>
                                    <div class="mt-4">
                                        <button type="button" class="theme-btn w-100">
                                            <span>
                                                Log in
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-right-thumb position-relative">
                                <img src="assets/img/sign/create.png" alt="img" />
                                <div class="signlogin-btnwrap">
                                    <button class="theme-create style-border" data-bs-toggle="modal"
                                        data-bs-target="#exampleModal">
                                        create account
                                    </button>
                                    <button class="theme-btn" data-bs-toggle="modal" data-bs-target="#exampleModal2">
                                        Log In
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="search-wrap">
                <div class="search-inner">
                    <i class="fas fa-times search-close" id="search-close"></i>
                    <div class="search-cell">
                        <form method="get">
                            <div class="search-field-holder">
                                <input type="search" class="main-search-input" placeholder="Search..." />
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div class="breadcrumb-wrapper bg-cover" style={{ backgroundImage: "url('assets/img/breadcrumb-1.jpg')" }}>
                <div class="container">
                    <div class="page-heading">
                        <div class="page-header-left">
                            <h1 class="wow fadeInUp" data-wow-delay=".3s">Group's List</h1>
                            <ul class="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                                <li>
                                    <a href="index.html">
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <i class="fa-regular fa-chevrons-right"></i>
                                </li>
                                <li>
                                    Group's List
                                </li>
                            </ul>
                        </div>
                        <div class="breadcrumb-image wow fadeInUp" data-wow-delay=".4s">
                            <img src="assets/img/breadcrumb.png" alt="img" />
                        </div>
                    </div>
                </div>
            </div>

            <section class="news-section fix section-padding">
                <div class="container">
                    <div class="row g-4">
                        <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                            <div class="news-card-items mt-0 box-shadow">
                                <div class="news-image">
                                    <img src="assets/img/news/01.jpg" alt="news-img" />
                                </div>
                                <div class="news-content">
                                    <div class="post-list">
                                        <span>Shared Hosting</span>
                                        <p>MARCH 24, 2024</p>
                                    </div>
                                    <h3>
                                        <a href="news-details.html">Attentive was born in 2015 help sales teams</a>
                                    </h3>
                                    <div class="author-items">
                                        <div class="author-image">
                                            <div class="author-img bg-cover"
                                                style={{ backgroundImage: "url('assets/img/news/post-1.png')" }}></div>
                                            <div class="content">
                                                <h6>Admin</h6>
                                                <p>Co, Founder</p>
                                            </div>
                                        </div>
                                        <a href="news-details.html" class="link-btn">
                                            <i class="fa-solid fa-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".5s">
                            <div class="news-card-items mt-0 box-shadow">
                                <div class="news-image">
                                    <img src="assets/img/news/02.jpg" alt="news-img" />
                                </div>
                                <div class="news-content">
                                    <div class="post-list">
                                        <span>Uncategorized</span>
                                        <p>MARCH 22, 2024</p>
                                    </div>
                                    <h3>
                                        <a href="news-details.html">Best and fastest data
                                            server ever</a>
                                    </h3>
                                    <div class="author-items">
                                        <div class="author-image">
                                            <div class="author-img bg-cover"
                                                style={{ backgroundImage: "url('assets/img/news/post-2.png')" }}
                                            ></div>
                                            <div class="content">
                                                <h6>Admin</h6>
                                                <p>Co, Founder</p>
                                            </div>
                                        </div>
                                        <a href="news-details.html" class="link-btn">
                                            <i class="fa-solid fa-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".7s">
                            <div class="news-card-items mt-0 box-shadow">
                                <div class="news-image">
                                    <img src="assets/img/news/03.jpg" alt="news-img" />
                                </div>
                                <div class="news-content">
                                    <div class="post-list">
                                        <span>Reseller Hosting</span>
                                        <p>MARCH 14, 2024</p>
                                    </div>
                                    <h3>
                                        <a href="news-details.html">Life won’t one beast air over above all</a>
                                    </h3>
                                    <div class="author-items">
                                        <div class="author-image">
                                            <div class="author-img bg-cover"
                                                style={{ backgroundImage: "url('assets/img/news/post-3.png')" }}
                                            ></div>
                                            <div class="content">
                                                <h6>Admin</h6>
                                                <p>Co, Founder</p>
                                            </div>
                                        </div>
                                        <a href="news-details.html" class="link-btn">
                                            <i class="fa-solid fa-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                            <div class="news-card-items mt-0 box-shadow">
                                <div class="news-image">
                                    <img src="assets/img/news/07.jpg" alt="news-img" />
                                </div>
                                <div class="news-content">
                                    <div class="post-list">
                                        <span>Shared Hosting</span>
                                        <p>MARCH 24, 2024</p>
                                    </div>
                                    <h3>
                                        <a href="news-details.html">Hosting Guide Everything You Need to Know</a>
                                    </h3>
                                    <div class="author-items">
                                        <div class="author-image">
                                            <div class="author-img bg-cover"
                                                style={{ backgroundImage: "url('assets/img/news/post-1.png')" }}
                                            ></div>
                                            <div class="content">
                                                <h6>Admin</h6>
                                                <p>Co, Founder</p>
                                            </div>
                                        </div>
                                        <a href="news-details.html" class="link-btn">
                                            <i class="fa-solid fa-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".5s">
                            <div class="news-card-items mt-0 box-shadow">
                                <div class="news-image">
                                    <img src="assets/img/news/08.jpg" alt="news-img" />
                                </div>
                                <div class="news-content">
                                    <div class="post-list">
                                        <span>Uncategorized</span>
                                        <p>MARCH 22, 2024</p>
                                    </div>
                                    <h3>
                                        <a href="news-details.html">The Importance of Reliable Hosting for Your Online </a>
                                    </h3>
                                    <div class="author-items">
                                        <div class="author-image">
                                            <div class="author-img bg-cover"
                                                style={{ backgroundImage: "url('assets/img/news/post-2.png')" }}
                                            ></div>
                                            <div class="content">
                                                <h6>Admin</h6>
                                                <p>Co, Founder</p>
                                            </div>
                                        </div>
                                        <a href="news-details.html" class="link-btn">
                                            <i class="fa-solid fa-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".7s">
                            <div class="news-card-items mt-0 box-shadow">
                                <div class="news-image">
                                    <img src="assets/img/news/09.jpg" alt="news-img" />
                                </div>
                                <div class="news-content">
                                    <div class="post-list">
                                        <span>Reseller Hosting</span>
                                        <p>MARCH 14, 2024</p>
                                    </div>
                                    <h3>
                                        <a href="news-details.html">Top 10 Hosting Mistakes to Avoid for a Seamless </a>
                                    </h3>
                                    <div class="author-items">
                                        <div class="author-image">
                                            <div class="author-img bg-cover"
                                                style={{ backgroundImage: "url('assets/img/news/post-3.png')" }}
                                            ></div>
                                            <div class="content">
                                                <h6>Admin</h6>
                                                <p>Co, Founder</p>
                                            </div>
                                        </div>
                                        <a href="news-details.html" class="link-btn">
                                            <i class="fa-solid fa-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="page-nav-wrap pt-5 text-center wow fadeInUp" data-wow-delay=".3s">
                        <ul>
                            <li><a class="page-numbers icon" href="news-grid.html#"><i
                                class="fa-solid fa-arrow-left-long"></i></a></li>
                            <li><a class="page-numbers" href="news-grid.html#">01</a></li>
                            <li><a class="page-numbers" href="news-grid.html#">02</a></li>
                            <li><a class="page-numbers" href="news-grid.html#">03</a></li>
                            <li><a class="page-numbers icon" href="news-grid.html#"><i
                                class="fa-solid fa-arrow-right-long"></i></a></li>
                        </ul>
                    </div>
                </div>
            </section>

            <footer class="footer-section fix bg-cover"  style={{ backgroundImage: "url('assets/img/section-bg.jpg')" }} >
                <div class="footer-widgets-wrapper">
                    <div class="container">
                        <div class="row">
                            <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                                <div class="single-footer-widget">
                                    <div class="widget-head">
                                        <a href="index.html">
                                            <img src="assets/img/logo/white-logo.svg" alt="logo-img" />
                                        </a>
                                    </div>
                                    <div class="footer-content">
                                        <p>
                                            Nullam interdum libero vitae pretium aliquam donec nibh purus laoreet in ullamcorper
                                            vel malesuada.
                                        </p>
                                        <ul class="contact-info">
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                    viewBox="0 0 20 20" fill="none">
                                                    <g clip-path="url(#clip0_4461_529)">
                                                        <path
                                                            d="M18.7719 14.1213C18.7388 14.0938 14.9913 11.4275 13.9794 11.5906C13.4913 11.6769 13.2125 12.01 12.6531 12.6762C12.4985 12.8617 12.3403 13.0443 12.1788 13.2238C11.8252 13.1086 11.4804 12.9682 11.1469 12.8038C9.42533 11.9656 8.03437 10.5747 7.19625 8.85312C7.03179 8.51964 6.89143 8.1748 6.77625 7.82125C6.96 7.65312 7.2175 7.43625 7.3275 7.34375C7.99062 6.7875 8.32312 6.50812 8.40938 6.01937C8.58625 5.0075 5.90625 1.26125 5.87875 1.2275C5.7567 1.05441 5.59775 0.910578 5.41336 0.806386C5.22897 0.702193 5.02374 0.640241 4.8125 0.625C3.72625 0.625 0.625 4.6475 0.625 5.32562C0.625 5.365 0.681875 9.3675 5.6175 14.3881C10.6325 19.3181 14.635 19.375 14.6744 19.375C15.3519 19.375 19.375 16.2737 19.375 15.1875C19.3596 14.9762 19.2975 14.771 19.1932 14.5866C19.0889 14.4022 18.945 14.2433 18.7719 14.1213ZM14.605 18.1213C14.0625 18.075 10.7 17.6319 6.5 13.5063C2.35437 9.28563 1.9225 5.9175 1.87937 5.39563C2.69861 4.10978 3.68799 2.94064 4.82062 1.92C4.84562 1.945 4.87875 1.9825 4.92125 2.03125C5.78989 3.21702 6.53817 4.48642 7.155 5.82062C6.95441 6.02242 6.7424 6.21253 6.52 6.39C6.17512 6.65278 5.85843 6.95063 5.575 7.27875C5.52704 7.34604 5.4929 7.42217 5.47456 7.50274C5.45621 7.5833 5.45403 7.66671 5.46812 7.74813C5.60039 8.32108 5.80297 8.87549 6.07125 9.39875C7.03243 11.3725 8.62735 12.9672 10.6012 13.9281C11.1244 14.1968 11.6788 14.3996 12.2519 14.5319C12.3333 14.5463 12.4168 14.5443 12.4974 14.5259C12.578 14.5075 12.6541 14.4732 12.7213 14.425C13.0505 14.1404 13.3494 13.8225 13.6131 13.4762C13.8094 13.2425 14.0712 12.9306 14.1706 12.8425C15.5082 13.4587 16.7805 14.2079 17.9681 15.0787C18.02 15.1225 18.0569 15.1562 18.0812 15.1781C17.0606 16.3111 15.8912 17.3007 14.605 18.12V18.1213ZM14.375 9.375H15.625C15.6235 8.04937 15.0962 6.77847 14.1589 5.84111C13.2215 4.90375 11.9506 4.37649 10.625 4.375V5.625C11.6193 5.62599 12.5725 6.0214 13.2756 6.72445C13.9786 7.42749 14.374 8.38074 14.375 9.375Z"
                                                            fill="white" />
                                                        <path
                                                            d="M17.5 9.375H18.75C18.7475 7.22088 17.8907 5.15569 16.3675 3.6325C14.8443 2.1093 12.7791 1.25248 10.625 1.25V2.5C12.4477 2.50215 14.1951 3.22717 15.484 4.51602C16.7728 5.80486 17.4978 7.5523 17.5 9.375Z"
                                                            fill="white" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_4461_529">
                                                            <rect width="20" height="20" fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>
                                                <a href="tel:+61086660112">+6108-666-0112</a>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                    viewBox="0 0 20 20" fill="none">
                                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                                        d="M18.0812 13.1941C18.0812 14.883 16.7074 16.2547 15.0206 16.2547H4.97935C3.2926 16.2547 1.91873 14.883 1.91873 13.1941V6.805C1.91835 6.26068 2.06418 5.72624 2.34096 5.25754L7.24049 10.1571C7.9735 10.8922 8.9551 11.2973 10.001 11.2973C11.0448 11.2973 12.0264 10.8922 12.7594 10.1571L17.659 5.25754C17.9358 5.72623 18.0816 6.26067 18.0812 6.805V13.1941H18.0812ZM15.0206 3.74441H4.97935C4.28279 3.74441 3.63978 3.98016 3.12541 4.37238L8.07424 9.32336C8.5865 9.83344 9.27017 10.1164 10.001 10.1164C10.7297 10.1164 11.4135 9.83344 11.9257 9.32336L16.8745 4.37238C16.3602 3.98016 15.7172 3.74441 15.0206 3.74441ZM15.0206 2.56348H4.97935C2.64103 2.56348 0.737793 4.46672 0.737793 6.80504V13.1942C0.737793 15.5346 2.64103 17.4357 4.97935 17.4357H15.0206C17.3589 17.4357 19.2622 15.5346 19.2622 13.1942V6.805C19.2622 4.46668 17.3589 2.56348 15.0206 2.56348Z"
                                                        fill="white" />
                                                </svg>
                                                <a href="mailto:info@example.com">info@example.com</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="col-xl-2 col-lg-4 col-md-3 ps-lg-3 wow fadeInUp" data-wow-delay=".4s">
                                <div class="single-footer-widget">
                                    <div class="widget-head">
                                        <h3>Company</h3>
                                    </div>
                                    <ul class="list-area">
                                        <li>
                                            <a href="about.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                ClueHost About
                                            </a>
                                        </li>
                                        <li>
                                            <a href="contact.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Contact Us
                                            </a>
                                        </li>
                                        <li>
                                            <a href="pricing.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Pricing Plans
                                            </a>
                                        </li>
                                        <li>
                                            <a href="faq.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                FAQ’S
                                            </a>
                                        </li>
                                        <li>
                                            <a href="contact.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Privacy Policy
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="col-xl-2 col-lg-4 col-md-3 ps-lg-4 wow fadeInUp" data-wow-delay=".6s">
                                <div class="single-footer-widget style-margin">
                                    <div class="widget-head">
                                        <h3>Hosting</h3>
                                    </div>
                                    <ul class="list-area">
                                        <li>
                                            <a href="https://ex-coders.com/html/cluehost/shared-hosting.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Shared Hosting
                                            </a>
                                        </li>
                                        <li>
                                            <a href="reseller-hosting.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Reseller Hosting
                                            </a>
                                        </li>
                                        <li>
                                            <a href="vps-hosting.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                VPS Hosting
                                            </a>
                                        </li>
                                        <li>
                                            <a href="cloud-hosting.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Cloud Hosting
                                            </a>
                                        </li>
                                        <li>
                                            <a href="dedicated-hosting.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Dedicated Hosting
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="col-xl-2 col-lg-4 col-md-6 ps-lg-4 wow fadeInUp" data-wow-delay=".8s">
                                <div class="single-footer-widget">
                                    <div class="widget-head">
                                        <h3>Support</h3>
                                    </div>
                                    <ul class="list-area">
                                        <li>
                                            <a href="https://ex-coders.com/html/cluehost/login.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Login Account
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://ex-coders.com/html/cluehost/register.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Register Account
                                            </a>
                                        </li>
                                        <li>
                                            <a href="contact.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Submit Ticket
                                            </a>
                                        </li>
                                        <li>
                                            <a href="support.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Support Center
                                            </a>
                                        </li>
                                        <li>
                                            <a href="contact.html">
                                                <i class="fa-regular fa-chevrons-right"></i>
                                                Live Chat
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="col-xl-3 col-lg-4 col-md-6 ps-lg-4 wow fadeInUp" data-wow-delay=".9s">
                                <div class="single-footer-widget">
                                    <div class="widget-head">
                                        <h3>Newsletter</h3>
                                    </div>
                                    <div class="footer-content">
                                        <p>
                                            Sign up to seargin weekly newsletter to get the latest updates.
                                        </p>
                                        <div class="footer-input">
                                            <input type="email" id="email2" placeholder="Enter Email Address" />
                                            <button class="newsletter-btn" type="submit">
                                                <i class="fa-regular fa-paper-plane"></i>
                                            </button>
                                        </div>
                                        <div class="social-icon d-flex align-items-center">
                                            <a href="news-grid.html#"><i class="fab fa-facebook-f"></i></a>
                                            <a href="news-grid.html#"><i class="fab fa-twitter"></i></a>
                                            <a href="news-grid.html#"><i class="fa-brands fa-linkedin-in"></i></a>
                                            <a href="news-grid.html#"><i class="fa-brands fa-youtube"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <div class="container">
                        <div class="footer-wrapper d-flex align-items-center justify-content-between">
                            <p class="wow fadeInLeft" data-wow-delay=".3s">
                                © All Copyright 2024 by <a href="index.html">ClueHost </a>
                            </p>
                            <ul class="brand-logo wow fadeInRight" data-wow-delay=".5s">
                                <li>
                                    <img src="assets/img/visa-logo.png" alt="img" />
                                </li>
                                <li>
                                    <a href="contact.html">
                                        <img src="assets/img/mastercard-logo.png" alt="img" />
                                    </a>
                                </li>
                                <li>
                                    <a href="contact.html">
                                        <img src="assets/img/payoneer-logo.png" alt="img" />
                                    </a>
                                </li>
                                <li>
                                    <a href="contact.html">
                                        <img src="assets/img/affirm-logo.png" alt="img" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <a href="news-grid.html#" id="scrollUp" class="scroll-icon">
                        <i class="far fa-arrow-up"></i>
                    </a>
                </div>
            </footer>
        </div>
    )
}

export default Homepage;
