import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { FullContext } from "../_app";

export default function Login({ setConnected, setToken }) {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const { isConnected, token } = useContext(FullContext);
    const router = useRouter();
    const { code } = router.query;

    useEffect(() => {
        const fetchData = async () => {
            if (!code) {
                return;
            }

            if (typeof window !== 'undefined') {
                switch (code) {
                    case "02653854":
                        alert("Please connect using your credentials!");
                        break;
                    case "56932417":
                        alert("Something went wrong. Reconnect, please.");
                        break;
                    case "48593215":
                        try {
                            const form = new FormData();
                            form.append("token", token);
                            form.append("logout","true");

                            const response = await fetch(
                                `http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/users/`,
                                {
                                    method: "DELETE",
                                    body: form,
                                }
                            );

                            if (response.ok) {
                                setConnected(false);
                                localStorage.setItem('isConnected', 'false');
                                setToken(0);
                                router.push('/');
                            } else {
                                const errorData = await response.json();
                                alert("Authentication failed: " + errorData.error);
                            }
                        } catch (error) {
                            console.error("Anauthorized");
                        }
                        break;
                    default:
                        break;
                }
            }
        };

        fetchData();
    }, [code, token, router]);


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

    const handleFormSubmit = async () => {


        if (email.length < 6 || email.indexOf("@") < 0 || password.length < 4) {
            alert("Please enter your information correctly!");
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("email", email);
            formDataToSend.append("password", password);

            const response = await fetch(
                "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/users/",
                {
                    method: "PATCH",
                    body: formDataToSend,
                }
            );

            if (response.ok) {
                const data = await response.json();
                setConnected(true);
                setToken(data.token);
                localStorage.setItem("token",token)
                router.push('/home');
            } else {
                const errorData = await response.json();
                alert("Authentication failed: " + errorData.error);
            }
        } catch (error) {
            console.error("Error during authentication:", error.message);
        }

    };

    return (
        <div className=" d-flex align-items-center justify-content-center p-5">
            <div className="row d-flex justify-content-center align-items-center col-xl-3 col-lg-3 col-md-5 col-sm-10 col-xs-12">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
                    <div
                        className="bg-transparent text-dark rounded"
                    >
                        <div className="card-body p-md-5 ">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <h2 className="text-center h2 mb-2 mx-1 my-4 md-4">
                                    <i className="bi bi-people mr-3"></i>
                                        Let's Connect
                                    </h2>

                                    <form>

                                        <label className="form-label mt-2" htmlFor="email">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
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
                                            className="form-control mb-4"
                                            onChange={handleInputChange}
                                        />

                                        <br />
                                        <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                            <button
                                                type="button"
                                                className="btn btn-dark btn-lg inverse-hover"
                                                onClick={handleFormSubmit}
                                            >
                                                Connect
                                            </button>
                                        </div>
                                        <input type="checkbox" style={{ accentColor: "black" }} />&nbsp;&nbsp;&nbsp;Remember this device
                                        <div className="row mt-2">
                                            <hr className="w-25 mr-auto border border-dark" />
                                            <span className="h5">continue with </span>
                                            <hr className="w-25 mr-auto border border-dark" />
                                            <br />
                                        </div>
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
    );
}
