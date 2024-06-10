import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { validateEmail } from "@/utils/general";
import { Link } from "@mui/material";

export default function Recovery({ setWarning }) {
    const [personalData, setPersonalData] = useState({
        email: "",
        recoveryKey: "",
        password: "",
        passwordConfirmation: ""
    });

    const [recoveryProcess, setRecoveryProcess] = useState({
        keySent: false,
        keyVerified: false
    });

    const router = useRouter();

    const [buttonContent, setButtonContent] = useState(<span>Proceed</span>);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPersonalData((prev) => ({ ...prev, [name]: value }));
    };

    const sendMail = async () => {
        if (!validateEmail(personalData.email)) {
            setWarning({
                message: "Invalid email address",
                type: "warning",
                isShown: true
            });
            return;
        }

        setButtonContent(
            <span>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Please wait
            </span>
        );

        try {
            const connectionForm = new FormData();
            connectionForm.append("reset", true);
            connectionForm.append("step", "1");
            connectionForm.append("email", personalData.email);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}users/`, {
                method: "POST",
                body: connectionForm,
            });


            if (response.ok) {
                setRecoveryProcess((prev) => ({ ...prev, keySent: true }));
            } else {
                setWarning({
                    message: "Something went wrong, please try again later.",
                    type: "danger",
                    isShown: true
                });
            }
        } catch (error) {
            setWarning({
                message: `Something went wrong, please try again later or contact support. ${error}`,
                type: "danger",
                isShown: true
            });
        } finally {
            setButtonContent(<span>Proceed</span>);
        }
    };

    const sendRecoveryKey = async () => {
        if (personalData.recoveryKey.startsWith("Matious-") && personalData.recoveryKey.length < 28) {
            setWarning({
                message: "Invalid key",
                type: "warning",
                isShown: true
            });
            return;
        }

        setButtonContent(
            <span>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Please wait
            </span>
        );

        try {
            const connectionForm = new FormData();
            connectionForm.append("reset", true);
            connectionForm.append("step", "2");
            connectionForm.append("email", personalData.email);
            connectionForm.append("recoveryKey", personalData.recoveryKey);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}users/`, {
                method: "POST",
                body: connectionForm,
            });
            const data = await response.json()
            if (response.ok) {
                setRecoveryProcess((prev) => ({ ...prev, keyVerified: true }));
            } else {
                let message = "Something went wrong, please try again later."
                if (data.error == "not allowed now") {
                    message = "you have reached te limit of retry attempts, please try again in 8 hours or contact support."
                } else if (parseInt(data.remaining) > 0) {
                    message = `You still have ${parseInt(data.remaining)} attempts, please check your key and remove any white spaces.`

                }
                setWarning({
                    message: message,
                    type: "danger",
                    isShown: true
                });
            }
        } catch (error) {
            setWarning({
                message: "something went wrong, please try again later.",
                type: "danger",
                isShown: true
            });
        } finally {
            setButtonContent(<span>Proceed</span>);
        }
    };

    const changePassword = async () => {
        if (personalData.password !== personalData.passwordConfirmation || personalData.password.length < 8) {
            setWarning({
                message: "Password too short or passwords do not match",
                type: "warning",
                isShown: true
            });
            return;
        }

        setButtonContent(
            <span>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Please wait
            </span>
        );

        try {
            const connectionForm = new FormData();
            connectionForm.append("reset", true);
            connectionForm.append("step", "3");
            connectionForm.append("email", personalData.email);
            connectionForm.append("recoveryKey", personalData.recoveryKey);
            connectionForm.append("password", personalData.password);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}users/`, {
                method: "POST",
                body: connectionForm,
            });

            if (response.ok) {
                router.push("../login");
                setWarning({
                    message: "Please login using your new credentials",
                    type: "success",
                    isShown: true
                });
            } else {
                setWarning({
                    message: "Something went wrong, please try again later.",
                    type: "danger",
                    isShown: true
                });
            }
        } catch (error) {
            setWarning({
                message: `Something went wrong, please try again later or contact support. ${error}`,
                type: "danger",
                isShown: true
            });
        } finally {
            setButtonContent(<span>Proceed</span>);
        }
    };

    return (
        <div className="d-flex justify-content-center my-5 py-5">
            <div className="col-xl-3 col-lg-5 col-md-6 col-sm-11 border border-dark rounded mt-3 bg-transparent text-dark rounded">
                <p className="h3 p-2 mt-4 cursor-pointer" onClick={() => { router.push("../login") }}>
                    <i className="bi bi-arrow-left-circle-fill p-3" title="Go back"></i>
                </p>
                <div className="card-body">
                    <div className="row justify-content-center d-flex align-items-center">
                        <div className="col-12">
                            <h2 className="text-center h2 mb-2 mx-1 tilt-warp-title">
                                <i className="bi bi-shield-lock mr-3"></i>
                                Recovery Mode
                            </h2>
                            <div className="tilt-warp-title h6">
                                {!recoveryProcess.keySent ? (
                                    <>
                                        <label className="form-label mt-2" htmlFor="email">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={personalData.email}
                                            className="form-control mb-4"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <div className="d-flex justify-content-center mx-4 mb-3" onClick={sendMail}>
                                            <button className="btn btn-dark btn-lg">
                                                {buttonContent}
                                            </button>
                                        </div>
                                    </>
                                ) : !recoveryProcess.keyVerified ? (
                                    <>
                                        <p className="alert alert-info m-4 p-3">If it refers to a registered account, Please check your email, we&apos;ve sent a key to {personalData.email}, you have 3 attempts every 8 hours.</p>
                                        <label className="form-label mt-2" htmlFor="recoveryKey">
                                            Key
                                        </label>
                                        <input
                                            type="text"
                                            id="recoveryKey"
                                            name="recoveryKey"
                                            value={personalData.recoveryKey}
                                            className="form-control mb-4"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <div className="d-flex justify-content-center mx-4 mb-3" onClick={sendRecoveryKey}>
                                            <button className="btn btn-dark btn-lg">
                                                {buttonContent}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="alert alert-info m-2 p-3">For your security, please select a strong and unique password.</p>
                                        <label className="form-label mt-2" htmlFor="newPassword">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="password"
                                            value={personalData.password}
                                            className="form-control mb-4"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <label className="form-label mt-2" htmlFor="confPassword">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            id="confPassword"
                                            name="passwordConfirmation"
                                            value={personalData.passwordConfirmation}
                                            className="form-control mb-4"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <div className="d-flex justify-content-center mx-4 mb-3" onClick={changePassword}>
                                            <button className="btn btn-dark btn-lg">
                                                {buttonContent}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
