import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../_app";
import { Separation, validateEmail } from "@/utils/general";

export default function Login({ setToken, setWarning }) {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const { isLoggedIn } = useContext(AuthContext);
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case "email":
                setEmail(value);
                break;
            case "password":
                setPassword(value);
                break;
            default:
                break;
        }
    };

    const handleConnect = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setWarning({
                message: "email not valide !",
                type: "danger",
                isShown: true
            })
            return;
        }
        try {
            const connectionForm = new FormData();
            connectionForm.append("email", email);
            connectionForm.append("password", password);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}users/`,
                {
                    method: "PATCH",
                    body: connectionForm,
                }
            );

            if (response.ok) {
                const data = await response.json();
                setWarning({
                    message: "Welcome back !",
                    type: "success",
                    isShown: true
                })
                router.push("/home")
                const expirationTime = new Date().getTime() + 600000; // Current time + 1 hour (in ms)
                setToken(data.token);
                localStorage.setItem("token",data.token)
            } else {
                setWarning({
                    message: "please check your email and password",  //dont show any sign of existing account !
                    type: "danger",
                    isShown: true
                })
                setPassword("");
            }
        } catch (error) {
            console.error("An error occurred while connecting", error);
            setWarning({
                message: "something went wrong, please try again later or contact support [error code ... 943].",
                type :"danger",
                isShown: true
            })
        }
    };

    useEffect(()=>{
        isLoggedIn && router.push("/home");
    },[isLoggedIn])

    return (
        <div className="d-flex justify-content-center mt-5">
            <div className="d-flex justify-content-center align-items-center">
                <div className="col-12 border border-dark rounded mt-3">
                    <div className="bg-transparent text-dark rounded">
                        <div className="card-body p-md-5">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <h2 className="text-center h2 mb-2 mx-1 my-4 md-4 tilt-warp-title">
                                        <i className="bi bi-people-fill mr-3"></i>
                                        Let's Connect
                                    </h2>
                                    <form onSubmit={handleConnect} className="tilt-warp-title h6">
                                        <label className="form-label mt-2" htmlFor="email">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={email}
                                            minLength={10}
                                            className="form-control mb-4"
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
                                            value={password}
                                            minLength={8}
                                            className="form-control mb-4"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <br />
                                        <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                            >
                                                Connect
                                            </button>
                                        </div>
                                        <input type="checkbox" style={{ accentColor: "black" }} />&nbsp;&nbsp;&nbsp;Remember this device
                                        <p className="text-right mt-4"><span className="cursor-pointer hover-underline-black">Forgot password ?</span></p>
                                        <Separation desc="continue with" />
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
        
    );
}
