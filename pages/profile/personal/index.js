import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import ProfileNavbar from '@/comps//ProfileNavbar.js'; // Importing the profile component
import { AuthContext } from "@/pages/_app";
import { getPersonnalInfo } from "@/utils/general.js";

export default function ProfileCredentials({setWarning}) {
    const { token } = useContext(AuthContext);
    const [updateButtonContent, setUpdateButtonContent] = useState(<span>Update</span>)
    const CustomInput = ({ holder, id, label, showPen }) => {
        return (
            <div className="form-group">
                <label className="form-label" htmlFor={id}>
                    {label}
                </label>
                <div className="input-group align-items-center">
                    <input
                        className="form-control text-dark"
                        defaultValue={holder}
                        id={id}
                        name={id}
                        type="text"
                        minLength={(id==="fname" || id==="lname") ? 4: 8} 
                        readOnly={disabled[id]}
                        required={!disabled[id]}
                        onBlur={(e) => {
                            setPersonnalInfo((prevState) => ({ ...prevState, [id]: e.target.value }));
                        }}
                    />
                    <span className="input-group-append">
                        {showPen && <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={(e) => { setDisabled((prevState) => ({ ...prevState, [id]: !disabled[id] })); e.target.disabled = true; }}>
                            <i className="bi bi-pencil"></i>
                        </button>}
                    </span>
                </div>
            </div>
        );
    };

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

    const router = useRouter();


    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setUpdateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);
        try {
            const updatedData = new FormData();
            updatedData.append("token", token);
            if ( !disabled.password &&(personnalInfo.newPassword !== personnalInfo.newPasswordConf)) {
                // Check match passwords
                setWarning({
                    message: "New password fields does not match !",
                    type:"danger",
                    isShown: true
                })
                return;
            }

            let willUpdate = false;
            for (const [key, value] of Object.entries(personnalInfo)) {
                if (!disabled[key] && key !== "newPasswordConf" && key !== "email") { // Only append non-disabled fields, excluded match password confirmation
                    updatedData.append(key, value);
                    setPersonnalInfo((prevState) => ({
                        ...prevState,
                        key: value
                    }))
                    willUpdate = true;

                }
            }
            if (willUpdate) {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_ADDR}users/`,
                    {
                        method: "PUT",
                        body: updatedData,
                    }
                );
                if (response.ok) {
                    setWarning({
                        message: "Your informations has been updated succesfully",
                        type:"success",
                        isShown: true
                    })
                    const allFields = Object.keys(disabled);
                    const allFieldsToTrue = Object.fromEntries(allFields.map(field => [field, true]));
                    setDisabled(allFieldsToTrue);
                } else {
                    setWarning({
                        message:"Wrong password, please double check your credentials.",
                        type: "danger",
                        isShown: true 
                    })
                }
            } else {
                setWarning({
                    message:"No informations marked to be updated !",
                    type: "warning",
                    isShown: true 
                })
            }

        } catch (error) {
            console.error("Error during registration:", error.message);
        } finally {
            setTimeout(() => {
                setUpdateButtonContent(<span>Update</span>)
            }, 1000)
        }
    };

    useEffect(() => {
        token && getPersonnalInfo(token, setPersonnalInfo);            
    }, [token]); // Dependencies array is empty since it should run only once

    const [personnalInfoAreFetched, setpersonnalInfoAreFetched] = useState(false);

    useEffect(() => {
        // Check if all values in personnalInfo are non-null and non-undefined
        const isFetched = Object.values(personnalInfo).every(value => value !== null && value !== undefined);
        setpersonnalInfoAreFetched(isFetched);
    }, [personnalInfo]); // Re-run on changes to personnalInfo

    return (
        <>
            <ProfileNavbar />
            <div className="d-flex w-100 justify-content-center text-dark tilt-warp-title">
                {personnalInfoAreFetched ? (
                    <form className="mt-4 border border-dark rounded p-5" onSubmit={handleUpdateUser}>
                        <div className="row">
                            <div className="col">
                                <CustomInput holder={personnalInfo.fname} id="fname" label="First name" showPen={true} />
                            </div>
                            <div className="col">
                                <CustomInput holder={personnalInfo.lname} id="lname" label="Last name" showPen={true} />
                            </div>
                        </div>
                        <div className="form-group">
                            <CustomInput holder={personnalInfo.email} id="email" label="Email" showPen={false} />
                        </div>
                        <div className="form-group">
                            <CustomInput holder={personnalInfo.password} id="password" label="Password" showPen={true} />
                            {!disabled.password && (
                                <>
                                    <CustomInput holder={personnalInfo.newPassword} id="newPassword" label="New Password" showPen={false} />
                                    <CustomInput holder={personnalInfo.newPasswordConf} id="newPasswordConf" label="Validate Password" showPen={false} />
                                </>
                            )}
                        </div>
                        <div className="form-group">
                            <CustomInput holder={personnalInfo.role} id="role" label="Current role" showPen={true} />
                        </div>
                        <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <button
                                type="submit"
                                className="btn btn-dark border-light btn-lg inverse-hover"
                            >
                                {updateButtonContent}
                            </button>
                        </div>
                    </form>) : (
                    <form>
                        <button className="btn btn-light border-light btn-lg m-5 p-5">
                            <div className="spinner-border text-primary" style={{ fontSize: "40px" }} role="status">
                                <span className="visually-hidden"></span>
                            </div>
                        </button>

                    </form>)}
            </div >
        </>
    );
}