import { useState, useRef, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from '../_app';
import { Separation, validateEmail } from "@/utils/general";

export default function Signup({ setWarning }) {
    const router = useRouter();

    const [personnalInfo, setPersonnalInfo] = useState({
        fname: "",
        lname: "",
        email: "",
        role: "",
        password: "",
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPersonnalInfo(prevInfos => ({ ...prevInfos, [name]: value }));
    };



    const handleCreateAccount = async (e) => {
        e.preventDefault()
        if (!validateEmail(personnalInfo.email) || personnalInfo.fname.length < 3 || personnalInfo.lname.length < 3 || personnalInfo.password.length < 4 || personnalInfo.role.length < 6) {
            alert("please, fill your informations correctly !");
            return 0;
        }
        try {
            const signUpForm = new FormData();

            for (const [key, value] of Object.entries(personnalInfo)) {
                signUpForm.append(key, value);
            }
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}users/`,
                {
                    method: "POST",
                    body: signUpForm,
                }
            );

            if (response.status == 200) {
                setWarning({
                    message: "Welcome onboard Mr. " + personnalInfo.fname + ", please connect using your credentials.",
                    type: "success",
                    isShown: true
                })
                router.push("/login");
            } else {
                setWarning({
                    message: "This email is already associated with an account. if you think its not please contact our support service",
                    type: "warning",
                    isShown: true
                })
            }

        } catch (error) {
            console.error("Error during registration:", error.message);
        }
    };

    //redirect if user logged in
    const { isLoggedIn } = useContext(AuthContext);

    useEffect(() => {
        isLoggedIn && router.push("/home");
    }, [isLoggedIn, router])

    return (
        <div className="h-100 vh d-flex align-items-center justify-content-center p-5">
            <div>
                <div className="row  d-flex justify-content-center">
                    <div className="col-lg-12 col-xl-11 border border-dark rounded mt-2">
                        <div
                            className="bg-transparent text-dark rounded"
                        >
                            <div className="card-body p-md-5 ">
                                <div className="row justify-content-center">
                                    <div className=" order-2 order-lg-1 d-flex align-items-center justify-content-center">

                                        <form className="mx-1 mx-md-4 tilt-warp-title h6" onSubmit={handleCreateAccount}>
                                            <h2 className="text-center h2 mb-2 mx-1 mx-md-4">
                                                <i className="bi bi-people mr-3"></i>
                                                Let&apos;s Connect
                                            </h2>
                                            <div className="row">
                                                <div className="col">
                                                    <label className="form-label" htmlFor="fname">
                                                        First name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="fname"
                                                        name="fname"
                                                        placeholder="john"
                                                        value={personnalInfo.fname}
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
                                                        placeholder="doe"
                                                        minLength="3"
                                                        value={personnalInfo.lname}
                                                        className="form-control"
                                                        onChange={handleInputChange}
                                                        required />
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
                                                pattern="/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;"
                                                value={personnalInfo.email}
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
                                                title="Minimum eight characters, at least one uppercase letter, one lowercase letter and one number"
                                                value={personnalInfo.password}
                                                className="form-control"
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <label className="form-label mt-2" htmlFor="password">
                                                role
                                            </label>
                                            <input
                                                type="text"
                                                id="role"
                                                name="role"
                                                minLength="8"
                                                placeholder="Software Developer"
                                                value={personnalInfo.role}
                                                className="form-control"
                                                onChange={handleInputChange}
                                                required
                                            />

                                            <br />
                                            <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                <button
                                                    type="submit"
                                                    className="btn btn-dark btn-lg"
                                                >
                                                    Sign&nbsp;up
                                                </button>
                                            </div>
                                            <Separation desc="or continue with" />
                                            <br />
                                            <p className="btn btn-dark w-100"><i className="bi bi-github mr-3"></i>github</p>
                                            <p className="btn btn-light border border-dark w-100"><i className="bi bi-google mr-3"></i>google</p>
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
