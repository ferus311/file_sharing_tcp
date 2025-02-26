import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer class="footer-section fix bg-cover" style={{ backgroundImage: "url('/assets/img/section-bg.jpg')" }} >
            <div class="footer-widgets-wrapper">
                <div class="container">
                    <div class="row">
                        <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                            <div class="single-footer-widget">
                                <div class="widget-head">
                                    <a href="index.html">
                                        <img src="/assets/img/logo/white-logo.svg" alt="logo-img" />
                                    </a>
                                </div>
                                <div class="footer-content">
                                    <p>
                                        {t('footer_description')}
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
                                            <a href="#">+84359549763</a>
                                        </li>
                                        <li>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                viewBox="0 0 20 20" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M18.0812 13.1941C18.0812 14.883 16.7074 16.2547 15.0206 16.2547H4.97935C3.2926 16.2547 1.91873 14.883 1.91873 13.1941V6.805C1.91835 6.26068 2.06418 5.72624 2.34096 5.25754L7.24049 10.1571C7.9735 10.8922 8.9551 11.2973 10.001 11.2973C11.0448 11.2973 12.0264 10.8922 12.7594 10.1571L17.659 5.25754C17.9358 5.72623 18.0816 6.26067 18.0812 6.805V13.1941H18.0812ZM15.0206 3.74441H4.97935C4.28279 3.74441 3.63978 3.98016 3.12541 4.37238L8.07424 9.32336C8.5865 9.83344 9.27017 10.1164 10.001 10.1164C10.7297 10.1164 11.4135 9.83344 11.9257 9.32336L16.8745 4.37238C16.3602 3.98016 15.7172 3.74441 15.0206 3.74441ZM15.0206 2.56348H4.97935C2.64103 2.56348 0.737793 4.46672 0.737793 6.80504V13.1942C0.737793 15.5346 2.64103 17.4357 4.97935 17.4357H15.0206C17.3589 17.4357 19.2622 15.5346 19.2622 13.1942V6.805C19.2622 4.46668 17.3589 2.56348 15.0206 2.56348Z"
                                                    fill="white" />
                                            </svg>
                                            <a href="mailto:info@example.com">fongcypher@gmail.com</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-2 col-lg-4 col-md-3 ps-lg-3 wow fadeInUp" data-wow-delay=".4s">

                        </div>
                        <div class="col-xl-2 col-lg-4 col-md-3 ps-lg-4 wow fadeInUp" data-wow-delay=".6s">

                        </div>
                        <div class="col-xl-2 col-lg-4 col-md-6 ps-lg-4 wow fadeInUp" data-wow-delay=".8s">
                            <div class="single-footer-widget">
                                <div class="widget-head">
                                    <h3>{t('support')}</h3>
                                </div>
                                <ul class="list-area">
                                    <li>
                                        <a href="#">
                                            <i class="fa-regular fa-chevrons-right"></i>
                                            {t('login')}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <i class="fa-regular fa-chevrons-right"></i>
                                            {t('register')}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="contact.html">
                                            <i class="fa-regular fa-chevrons-right"></i>
                                            {t('submit_ticket')}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="support.html">
                                            <i class="fa-regular fa-chevrons-right"></i>
                                            {t('support_center')}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="contact.html">
                                            <i class="fa-regular fa-chevrons-right"></i>
                                            {t('live_chat')}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="col-xl-3 col-lg-4 col-md-6 ps-lg-4 wow fadeInUp" data-wow-delay=".9s">
                            <div class="single-footer-widget">
                                <div class="widget-head">
                                    <h3>{t('newsletter')}</h3>
                                </div>
                                <div class="footer-content">
                                    <p>
                                        {t('newsletter_description')}
                                    </p>
                                    <div class="footer-input">
                                        <input type="email" id="email2" placeholder={t('enter_email_address')} />
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
                            © {t('all_copyright')} 2024 by <a href="index.html">NetShare </a>
                        </p>
                        <ul class="brand-logo wow fadeInRight" data-wow-delay=".5s">
                            <li>
                                <img src="/assets/img/visa-logo.png" alt="img" />
                            </li>

                        </ul>
                    </div>
                </div>
                <a href="news-grid.html#" id="scrollUp" class="scroll-icon">
                    <i class="far fa-arrow-up"></i>
                </a>
            </div>
        </footer>
    )
}

export default Footer;
