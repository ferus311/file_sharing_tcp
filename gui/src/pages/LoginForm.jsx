const LoginForm = () => {
    return (
        <div>
        <div class="login-screen">
            <div class="login-content">
                <div class="login-header">
                    <button type="button" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="login-body d-md-flex d-grid gap-md-0 gap-5 align-items-center">
                    <div class="login-form-content">
                        <div class="box">
                            <h2>Welcome back!</h2>
                            <form action="news-grid.html#" class="login-form">
                                <div class="form-grp cmn-mb">
                                    <input type="email" placeholder="Email Address" />
                                </div>
                                <div class="form-grp">
                                    <input type="text" placeholder="Enter Password" />
                                </div>
                                <div class="d-flex forgot-inner-area cmn-mb justify-content-between gap-2 flex-wrap align-items-center">
                                    <div class="form-check checkmark-inner">
                                        <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked />
                                        <label class="form-check-label" for="flexCheckChecked">Remember me</label>
                                    </div>
                                    <a href="news-grid.html#" class="forgot">Forgot Your password?</a>
                                </div>
                                <button type="button" class="theme-btn w-100">
                                    <span>Log in</span>
                                </button>
                            </form>
                            <span class="orting-badge">Or</span>
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
                                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
                                <label class="form-check-label" for="flexRadioDefault1">I accept your terms & conditions</label>
                            </div>
                        </div>
                    </div>
                    <div class="login-right-thumb position-relative">
                        <img src="assets/img/sign/login.png" alt="img" />
                        <div class="signlogin-btnwrap">
                            <button class="theme-create style-border">Create account</button>
                            <button class="theme-btn">Log In</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="create-account-screen">
            <div class="create-account-content">
                <div class="create-account-header">
                    <button type="button" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="create-account-body d-md-flex d-grid gap-md-0 gap-5 align-items-center">
                    <div class="create-account-form-content">
                        <div class="box">
                            <h2>Create account</h2>
                            <form action="news-grid.html#" class="login-form">
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
                            <span class="orting-badge">Or</span>
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
                                    <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault11" />
                                    <label class="form-check-label" for="flexRadioDefault11">I accept your terms & conditions</label>
                                </div>
                            </div>
                            <div class="mt-4">
                                <button type="button" class="theme-btn w-100">
                                    <span>Log in</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="create-account-right-thumb position-relative">
                        <img src="assets/img/sign/create.png" alt="img" />
                        <div class="signlogin-btnwrap">
                            <button class="theme-create style-border">Create account</button>
                            <button class="theme-btn">Log In</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
        </div>
    )
}
