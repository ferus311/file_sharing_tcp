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
                                    <a href="/">
                                        <img src="assets/img/logo/white-logo.svg" alt="logo-img" />
                                    </a>
                                </div>
                                <div class="offcanvas__close">
                                    <button>
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="mobile-menu fix mb-3"></div>
                        </div>
                    </div>
                </div>
            </div>

            <header className="header-section-1" style={{ backgroundColor: '#384BFF' }}>
                <div id="header-sticky" className="header-1" style={{ backgroundColor: '#384BFF' }}>
                    <div className="container">
                        <div className="mega-menu-wrapper">
                            <div className="header-main">
                                <div className="header-left">
                                    <div className="logo">
                                        <a href="/" className="header-logo">
                                            <img src="assets/img/logo/white-logo.svg" alt="logo-img" />
                                        </a>
                                        <a href="/" className="header-logo-2">
                                            <img src="assets/img/logo/white-logo.svg" alt="logo-img" />
                                        </a>
                                    </div>
                                </div>
                                <div className="header-right d-flex justify-content-end align-items-center">
                                    <div className="mean__menu-wrapper">
                                        <div className="main-menu">
                                            <nav id="mobile-menu">
                                                <ul>
                                                    <li>
                                                        <Link to="/" style={{ color: 'white' }}>Home</Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/about" style={{ color: 'white' }}>About</Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/services" style={{ color: 'white' }}>Services</Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/contact" style={{ color: 'white' }}>Contact</Link>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                    <a href="news-grid.html#0" className="search-trigger search-icon" style={{ color: 'white' }}>
                                        <i className="fal fa-search"></i>
                                    </a>
                                    <div className="header__hamburger d-xl-block my-auto">
                                        <div className="sidebar__toggle">
                                            <i className="fas fa-bars" style={{ color: 'white' }}></i>
                                        </div>
                                    </div>
                                    <div className="button">
                                        {token ? (
                                            <Dropdown overlay={menu} trigger={['click']}>
                                                <span className="user-info theme-btn" style={{ color: 'white' }}>
                                                    Welcome, {username}!
                                                </span>
                                            </Dropdown>
                                        ) : (
                                            <Link to={"/login"}>
                                                <a className="theme-btn" style={{ color: 'white' }}>
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
