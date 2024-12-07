import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Dropdown, Menu } from "antd";


const Header = () => {
    const { token, username, logout } = useAuth();
    const navigate = useNavigate();

    const menu = (
        <Menu>
            <Menu.Item key="profile" onClick={() => navigate("/profile")}>
                Profile
            </Menu.Item>
            <Menu.Item key="logout" onClick={logout}>
                Log Out
            </Menu.Item>
        </Menu>
    );

    return (
        <div>
            <div className="mouse-cursor cursor-outer"></div>
            <div className="mouse-cursor cursor-inner"></div>

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

            <header className="header-section-1">
                <div id="header-sticky" className="header-1">
                    <div className="container">
                        <div className="mega-menu-wrapper">
                            <div className="header-main">
                                <div className="header-left">
                                    <div className="logo">
                                        <a href="index.html" className="header-logo">
                                            <img src="assets/img/logo/white-logo.svg" alt="logo-img" />
                                        </a>
                                        <a href="index.html" className="header-logo-2">
                                            <img src="assets/img/logo/black-logo.svg" alt="logo-img" />
                                        </a>
                                    </div>
                                </div>
                                <div className="header-right d-flex justify-content-end align-items-center">
                                    <div className="mean__menu-wrapper">
                                        <div className="main-menu">
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
                                    <a href="news-grid.html#0" className="search-trigger search-icon">
                                        <i className="fal fa-search"></i>
                                    </a>
                                    <div className="header__hamburger d-xl-block my-auto">
                                        <div className="sidebar__toggle">
                                            <i className="fas fa-bars"></i>
                                        </div>
                                    </div>
                                    <div className="button">
                                        {token ? (
                                            <Dropdown overlay={menu} trigger={['click']}>
                                                <span className="user-info theme-btn">
                                                    Welcome, {username}!
                                                </span>
                                            </Dropdown>
                                        ) : (
                                            <Link to={"/login"}>
                                                <a className="theme-btn">
                                                    Login
                                                    <i className="fa-solid fa-arrow-right-long"></i>
                                                </a>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;
