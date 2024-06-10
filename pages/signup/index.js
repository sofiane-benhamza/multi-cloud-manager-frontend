import { useState, useRef, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from '../_app';
import { Separation, validateEmail } from "@/utils/general";
import { eraser } from "fontawesome";

export default function Signup({ setWarning }) {
    const router = useRouter();

    const [connectButtonContent, setConnectButtonContent] = useState(
        <span>Sign&nbsp;up</span>
    );

    const [shaking, setShaking] = useState({
        github: false,
        google: false
    })

    const shake = (name) => {
        setShaking((prev) => ({ ...prev, [name]: true }))
        setTimeout(() => {
            setShaking((prev) => ({ ...prev, [name]: false }))
        }, 1000)
    }

    const [signupProcess, setSignupProcess] = useState({
        infoEntered: false
    });

    const [personalInfo, setPersonalInfo] = useState({
        fname: "",
        lname: "",
        email: "",
        role: "",
        password: "",
        key: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo(prevInfos => ({ ...prevInfos, [name]: value }));
    };

    const sendEmail = async () => {
        try {
            const confirmForm = new FormData();
            confirmForm.append("create", "1");
            confirmForm.append("step", "1");
            confirmForm.append("email", personalInfo.email);
            confirmForm.append("firstName", personalInfo.fname);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}users/`,
                {
                    method: "POST",
                    body: confirmForm,
                }
            );

            if (response.ok) {
                setSignupProcess({ infoEntered: true });
            } else {
                let message = "Something went wrong, please try again later.";

                if (response.status === 409) {
                    message = "This email address is already registered, if you forgot your password try the 'Password forgotten' option.";
                }
                setWarning({
                    message: message,
                    type: "warning",
                    isShown: true
                });
            }

        } catch (error) {
            console.error("Error during registration:", error.message);
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setConnectButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Please wait</span>);

        if (!validateEmail(personalInfo.email) || personalInfo.fname.length < 3 || personalInfo.lname.length < 3 || personalInfo.password.length < 4 || personalInfo.role.length < 6) {
            alert("Please, fill your information correctly!");
            return;
        }
        try {
            const signUpForm = new FormData();

            signUpForm.append("create", "1");
            signUpForm.append("step", "2");

            for (const [key, value] of Object.entries(personalInfo)) {
                signUpForm.append(key, value);
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}users/`,
                {
                    method: "POST",
                    body: signUpForm,
                }
            );

            if (response.ok) {
                setWarning({
                    message: "Welcome onboard Mr. " + personalInfo.fname + ", please connect using your credentials.",
                    type: "success",
                    isShown: true
                });
                router.push("/login");
            } else {
                setWarning({
                    message: "Something went wrong, please try again later.",
                    type: "warning",
                    isShown: true
                });
            }

        } catch (error) {
            setWarning({
                message: "Something went wrong, please try again later.",
                type: "warning",
                isShown: true
            });
        } finally {
            setConnectButtonContent(<span>Sign&nbsp;up</span>);
        }
    };

    const { isLoggedIn } = useContext(AuthContext);

    useEffect(() => {
        if (isLoggedIn) {
            router.push("/home");
        }
    }, [isLoggedIn, router]);

    return (
        <div className="h-100 vh d-flex align-items-center justify-content-center p-5">
            <div>
                <div className="row d-flex justify-content-center">
                    <div className="col-lg-12 col-xl-11 border border-dark rounded mt-2">
                        <div className="bg-transparent text-dark rounded">
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <div className="order-2 order-lg-1 d-flex align-items-center justify-content-center">
                                        <form className="mx-1 mx-md-4 tilt-warp-title h6" onSubmit={handleCreateAccount}>
                                            <h2 className="text-center h2 mb-2 mx-1 mx-md-4">
                                                <i className="bi bi-people mr-3"></i>
                                                Let&apos;s Connect
                                            </h2>

                                            {!signupProcess.infoEntered ? (
                                                <>
                                                    <div className="row">
                                                        <div className="col">
                                                            <label className="form-label" htmlFor="fname">
                                                                First name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="fname"
                                                                name="fname"
                                                                placeholder="John"
                                                                value={personalInfo.fname}
                                                                minLength="4"
                                                                className="form-control"
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <label className="form-label" htmlFor="lname">
                                                                Last name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="lname"
                                                                name="lname"
                                                                placeholder="Doe"
                                                                minLength="3"
                                                                value={personalInfo.lname}
                                                                className="form-control"
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <label className="form-label mt-2" htmlFor="email">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        placeholder="johndoe@example.com"
                                                        value={personalInfo.email}
                                                        className="form-control"
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <label className="form-label mt-2" htmlFor="password">
                                                        Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="password"
                                                        name="password"
                                                        placeholder="my-pa$$w0rd"
                                                        minLength={8}
                                                        maxLength={32}
                                                        title="Minimum eight characters, at least one uppercase letter, one lowercase letter, and one number"
                                                        value={personalInfo.password}
                                                        className="form-control"
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <label className="form-label mt-2" htmlFor="role">
                                                        Role
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="role"
                                                        name="role"
                                                        minLength="8"
                                                        placeholder="Software Developer"
                                                        value={personalInfo.role}
                                                        className="form-control"
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <p className="py-2 my-4 alert alert-info">
                                                        We&apos;ve sent a Signup Confirmation key to {personalInfo.email}, check your email.
                                                    </p>
                                                    <label className="form-label mt-2" htmlFor="key">
                                                        Signup key
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="key"
                                                        name="key"
                                                        minLength={10}
                                                        value={personalInfo.key}
                                                        className="form-control"
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </>
                                            )}

                                            <br />
                                            <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                {signupProcess.infoEntered ? (
                                                    <button type="submit" className="btn btn-dark btn-lg">
                                                        {connectButtonContent}
                                                    </button>
                                                ) : (
                                                    <button type="button" onClick={sendEmail} className="btn btn-dark btn-lg">
                                                        Confirm
                                                    </button>
                                                )}
                                            </div>
                                            <Separation desc="or continue with" />
                                            <p className={`btn btn-dark w-100 ${shaking.github ? "shaking" : ""}`} onClick={() => { shake("github") }}><i className="bi bi-github mr-3"></i>Github</p>
                                            <p className={`btn btn-light border border-dark w-100 ${shaking.google ? "shaking" : ""}`} onClick={() => { shake("google") }} ><i className="bi bi-google mr-3"></i>Google</p>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
