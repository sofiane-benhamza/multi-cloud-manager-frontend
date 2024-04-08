import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import ProfileNavbar from '../../../comps/ProfileNavbar.js'; // Importing the profile component
import { FullContext } from "../../_app";
import { getPersonnalInfo } from "../../../utils/functions.js";
const CustomInput = ({ setterFunc, holder, id, label, disabledValue, showPen, setDisabled }) => {
    return (

        <div className="form-group">
            <label className="form-label" htmlFor={id}>
                {label}
            </label>
            <div className="input-group align-items-center">
                <input
                    className="form-control text-dark"
                    value={holder}
                    id={id}
                    name={id}
                    type="text"
                    readOnly={disabledValue}
                    onChange={(e) => {
                        setterFunc((prevState) => ({ ...prevState, [id]: e.target.value }));

                    }} />
                <span className="input-group-append">
                    {showPen && <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={(e) => { setDisabled((prevState) => ({ ...prevState, [id]: !disabledValue })); e.target.disabled = true; }}>
                        <i className="bi bi-pencil"></i>
                    </button>}
                </span>
            </div>
        </div>
    );
};

export default function ProfileCredentials() {
    const { isConnected, token } = useContext(FullContext);
    const [updateButtonContent, setUpdateButtonContent] = useState(<span>Update</span>)

    const [personnalInfo, setPersonnalInfo] = useState({
        fname: "",
        lname: "",
        email: "",
        role: "",
        password: "*************",
        newPassword: "pa$$w0rd",
        newPasswordConf: "pa$$w0rd",
    });

    const [disabled, setDisabled] = useState({
        fname: true,
        lname: true,
        email: true,
        password: true,
        role: true
    });

    //check values only where its disabled :
    const personnalInfoFetched = () => {
        return Object.values(personnalInfo).every(value => value !== null && value !== undefined);
    };

    const router = useRouter();


    const handleUpdateUser = async () => {
        setUpdateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);
        try {
            const updatedData = new FormData();
            updatedData.append("token", token);

            if (personnalInfo.newPassword !== personnalInfo.newPasswordConf) {  // Check match passwords
                alert("Passwords do not match");
                return;
            }

            let willUpdate = false;
            for (const [key, value] of Object.entries(personnalInfo)) {
                if (!disabled[key] && key !== "newPasswordConf") { // Only append non-disabled fields, excluded match password confirmation
                    updatedData.append(key, value);
                    willUpdate = true;

                }
            }
            if (willUpdate) {
                const response = await fetch(
                    `http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/users/`,
                    {
                        method: "PUT",
                        body: updatedData,
                    }
                );
                if (response.ok) {
                    alert("Information updated successfully");
                    router.push("./");
                } else {
                    console.error("Something went wrong ... 283");
                }
            } else {
                setTimeout(() => {
                    alert("no informations provided to be updated !");
                    setUpdateButtonContent(<span>Update</span>)
                }, 1000)
            }

        } catch (error) {
            console.error("Error during registration:", error.message);
        }
    };

    useEffect(() => {
        // Verify connection
        isConnected ? null : router.push("/");

        getPersonnalInfo(token, setPersonnalInfo); // Call the async function

    }, []); // Dependencies array is empty since it should run only once

    return (
        <>
            <ProfileNavbar />
            <div className="d-flex row w-100 justify-content-center text-dark" style={{ minHeight: "calc( 100vh - 200px )" }}>
                {personnalInfoFetched() && (
                    <form className="mx-1 mx-md-4 ">
                        <div className="row">
                            <div className="col">
                                <CustomInput setterFunc={setPersonnalInfo} holder={personnalInfo.fname} id="fname" label="First name" disabledValue={disabled.fname} showPen={true} setDisabled={setDisabled} />
                            </div>
                            <div className="col">
                                <CustomInput setterFunc={setPersonnalInfo} holder={personnalInfo.lname} id="lname" label="Last name" disabledValue={disabled.lname} showPen={true} setDisabled={setDisabled} />
                            </div>
                        </div>
                        <div className="form-group">
                            <CustomInput setterFunc={setPersonnalInfo} holder={personnalInfo.email} id="email" label="Email" disabledValue={disabled.email} showPen={true} setDisabled={setDisabled} />
                        </div>
                        <div className="form-group">
                            <CustomInput setterFunc={setPersonnalInfo} holder={personnalInfo.password} id="password" label="Password" disabledValue={disabled.password} showPen={true} setDisabled={setDisabled} />
                            {!disabled.password && (
                                <>
                                    <CustomInput setterFunc={setPersonnalInfo} holder={personnalInfo.newPassword} id="newPassword" label="New Password" disabledValue={false} showPen={false} />
                                    <CustomInput setterFunc={setPersonnalInfo} holder={personnalInfo.newPasswordConf} id="newPasswordConf" label="Validate Password" disabledValue={false} showPen={false} />
                                </>
                            )}
                        </div>
                        <div className="form-group">
                            <CustomInput setterFunc={setPersonnalInfo} holder={personnalInfo.role} id="role" label="Current role" disabledValue={disabled.role} showPen={true} setDisabled={setDisabled} />
                        </div>
                        <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <button
                                type="button"
                                className="btn btn-dark border-light btn-lg inverse-hover"
                                onClick={handleUpdateUser}
                            >
                                {updateButtonContent}
                            </button>
                        </div>
                    </form>)}
            </div>
        </>
    );
}
