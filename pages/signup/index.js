import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { Dropdown } from "react-bootstrap";

export default function Signup({ setConnected }) {
    var popup = useRef(null);
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const success = (<div className="h-25 w-25 bg-light rounded border-light d-flex flex-column justify-content-center align-items-center"><p className="text-success font-weight-bold h4"></p>Saved Successfully ✅<button type="button" onClick={() => close_popup(true)} className="btn btn-success mt-4" > close</button></div>);
    const failed = (<div className="h-25 w-25 bg-light rounded border-light d-flex flex-column justify-content-center align-items-center"><p className="text-danger font-weight-bold h4"></p>User Already Exist ⛔<button type="button" onClick={() => close_popup(false)} className="btn btn-danger mt-4" > close</button></div>);


    const [messageOfRegistration, setMessageOfRegistration] = useState(success)

    const handleSelect = (question) => {
        setSelectedQuestion(question);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case "fname":
                setFname(value);
                break;
            case "lname":
                setLname(value);
                break;
            case "email":
                setEmail(value);
                break;
            case "password":
                setPassword(value);
                break; // Don't forget to add break here
            case "role":
                setRole(value)
            default:
                break;
        }
    };


    const handleFormSubmit = async () => {

        if (fname.length < 3 || lname.length < 3 || email.length < 3 || email.indexOf("@") < 0 || password.length < 4) {
            alert("please, fill your informations correctly !");
            return 0;
        }
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("fname", fname);
            formDataToSend.append("lname", lname);
            formDataToSend.append("email", email);
            formDataToSend.append("password", password);
            formDataToSend.append("role", role);

            const response = await fetch(
                "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/users/",
                {
                    method: "POST",
                    body: formDataToSend,
                }
            );

            response.status != 200 ? setMessageOfRegistration(failed) : setMessageOfRegistration(success);
            popup.current.classList.remove("d-none");
            popup.current.classList.add("d-flex");

        } catch (error) {
            console.error("Error during registration:", error.message);
        }
    };

    function close_popup(connect) {
        if (popup.current) {
            popup.current.classList.remove("d-flex");
            popup.current.classList.add("d-none");
        }
        if (connect) {
            router.push('/login?code=02653854');
        } else {
            alert("votre mot de passe et/ou mail est incorrect !")
        }
    }

    return (
        <div className="h-100 vh d-flex align-items-center justify-content-center p-5">
        <div>
            <div
                ref={popup}
                style={{ zIndex: "10", backdropFilter: "blur(10px)" }}
                className="w-100 h-100 position-absolute top-0 z-4 content d-none justify-content-center align-items-center "
            >
                {messageOfRegistration}

            </div>

            <div className="row  d-flex justify-content-center">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-2">
                    <div
                        className="bg-transparent text-dark"
                        style={{ borderRadius: "25px" }}
                    >
                        <div className="card-body p-md-5 ">
                            <div className="row justify-content-center">
                                <div className=" order-2 order-lg-1 d-flex align-items-center justify-content-center">

                                    <form className="mx-1 mx-md-4">
                                    <h2 className="text-center h2 mb-2 mx-1 mx-md-4">
                                    <i className="bi bi-people mr-3"></i>
                                        Let's Connect
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
                                                    className="form-control"
                                                    onChange={handleInputChange}
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
                                            className="form-control"
                                            onChange={handleInputChange}
                                        />
                                              <label className="form-label mt-2" htmlFor="password">
                                            role
                                        </label>
                                        <input
                                            type="text"
                                            id="role"
                                            name="role"
                                            placeholder="Software Developer"
                                            className="form-control"
                                            onChange={handleInputChange}
                                        />

                                        <br />
                                        <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                            <button
                                                type="button"
                                                className="btn btn-dark btn-lg"
                                                onClick={handleFormSubmit}
                                            >
                                                Register
                                            </button>
                                        </div>
                                        <div className="row">
                                        <hr className="w-25 border border-dark"/> 
                                        <span className="h5"> or continue with </span>
                                        <hr className="w-25 border border-dark"/> 
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
        </div>
    );
}
