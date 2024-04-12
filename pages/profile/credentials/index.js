"use client"

import { useRouter } from "next/router";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { useEffect, useContext, useState } from "react";
import ProfileNavbar from '../../../comps/ProfileNavbar.js'; // Importing the profile component
import { FullContext } from "../../_app";
import { getCredentials  } from "../../../utils/functions"

export default function ProfileCredentials({setWarning}) {
    const { token } = useContext(FullContext);
    const router = useRouter();
    const [addCredentialActive, setAddCredentialActive] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [newAccount, setNewAccount] = useState({
        cloud: "aws",
        accessKeyId: "",
        secretAccessKey: ""
    })



    const handleCloudChange = (cloud) => {
        setNewAccount(prevState => ({
            ...prevState,
            [cloud]: cloud
        }))
    }

    useEffect(() => {
        token &&
            getCredentials(token, setAccounts, true);  //true = get full informations
    }, [token]);

    const submitCredential = async (e) => {
        e.preventDefault();
        try {
            const form = new FormData();
            form.append("token", token);
            form.append("accessKeyId", newAccount.accessKeyId);
            form.append("secretAccessKey", newAccount.secretAccessKey);
            form.append("cloud", newAccount.cloud)
            const response = await fetch(
                "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/cloud/",
                {
                    method: "POST",
                    body: form,
                }
            );

            if (response.ok) {
                const data = await response.json();
                setWarning({
                    message: "Credentials saved succesfully",
                    type:"success",
                    isShown: true
                })
                setAccounts([...accounts, {
                    id: 'will be generated',
                    accessKeyId: newAccount.accessKeyId,
                    secretAccessKey: newAccount.secretAccessKey,
                    cloud: newAccount.cloud
                }])
            }else{
                setWarning({
                    message: "Something went wrong, please try again later or contact support [error : 981]",
                    type:"danger",
                    isShown: true
                })
            }
        } catch (error) {
            console.error("something went wrong");
        }


    }
    const deleteCredential = async (id) => {
        try {
            const credential = new FormData();
            credential.append("token", token);
            credential.append("uniqueName", id)
            const response = await fetch(
                "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/cloud/",
                {
                    method: "DELETE",
                    body: credential
                }
            );
            if (response.ok) {
                setWarning({
                    message:"Credentials deleted successfully",
                    type:"success",
                    isShown: true
                })
                // Filter out the item with the id to delete
                const updatedAccounts = accounts.filter(item => item.id !== id);
                // Update the state with the new array
                setAccounts(updatedAccounts);
            } else {
                setWarning({
                    message: "Something went wrong, please try again later or contact support [error : 983]",
                    type:"danger",
                    isShown: true
                })
            }
        } catch (error) {
            console.error("something went wrong");
        }
    }

    const CredentialCard = ({ cloud, id, accessKeyId, secretAccessKey, index }) => {

        let name, srcOfLogo;
        switch (cloud) {
            case "aws":
                name = "Amazon Web Services";
                srcOfLogo = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png";
                break;
            default:
                break;
        }
        return (
            <Card key={index} className="mb-5 col-xl-3 col-lg-4 col-md-6 col-sm-12 col-xs-12">
                <div className="mx-2 border border-dark rounded">
                    <CardHeader className="justify-between">
                        <div className="d-flex flex-row justify-content-left align-items-center gap-5">
                            <div>
                                <img className="bg-light p-2" width="40px" height="35px" src={srcOfLogo} alt="Logo" />
                            </div>
                            <div className="ml-3 m-0 d-flex flex-row align-items-center">
                                <div className="font-semibold leading-none font-weight-bolder baloo-da-beautiful">{name}</div>
                            </div>
                            <button className="text-light ml-auto border bg-danger p-2 rounded" onClick={() => { if (id !== "will be generated") { deleteCredential(id) } }}>
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    </CardHeader>
                    <CardBody className="overflow-visible d-flex flex-column justify-content-center">
                        <table className="table text-dark">
                            <tbody>
                                <tr>
                                    <td>ID</td>
                                    <td>{id}</td>
                                </tr>
                                <tr>
                                    <td>Access Key ID</td>
                                    <td>{accessKeyId}</td>
                                </tr>
                                <tr>
                                    <td>Secret Access Key</td>
                                    <td>{secretAccessKey}</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardBody>
                </div>
            </Card>
        );
    }

    const AddCredentialCard = () => {
        return addCredentialActive ? (
            <Card className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-xs-12 d-flex justify-content-center align-items-center mb-5" >
                <form className="border rounded w-100" onSubmit={submitCredential}>
                    <CardHeader className="justify-between">
                        <div className="d-flex flex-row justify-content-left align-items-center gap-5">
                            <div className="m-0 d-flex flex-row align-items-center">
                                <div className="form-check m-1">
                                    <input className="form-check-input" type="radio" name="cloud" id="aws" value="aws" onClick={(e) => handleCloudChange(e.target.value)} defaultChecked />
                                    <label className="form-check-label" htmlFor="aws">
                                        AWS
                                    </label>
                                </div>
                                <div className="form-check m-1">
                                    <input className="form-check-input" type="radio" name="cloud" id="azure" value="azure" onClick={(e) => handleCloudChange(e.target.value)} />
                                    <label className="form-check-label" htmlFor="azure">
                                        AZURE
                                    </label>
                                </div>
                                <div className="form-check m-1">
                                    <input className="form-check-input" type="radio" name="cloud" id="gcp" value="gcp" onClick={(e) => handleCloudChange(e.target.value)} />
                                    <label className="form-check-label" htmlFor="gcp">
                                        GCP
                                    </label>
                                </div>
                            </div>
                            <button className="text-dark ml-auto border bg-success p-2 rounded" type="submit">
                                <i className="bi bi-bookmark-plus"></i>
                            </button>
                        </div>
                    </CardHeader>
                    <CardBody className="overflow-visible d-flex flex-column justify-content-center">
                        <table className="table text-dark">
                            <tbody>
                                <tr>
                                    <td>Access Key ID</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="w-100"
                                            minLength={8}
                                            defaultValue={newAccount.accessKeyId}
                                            onBlur={(e) => { setNewAccount(prevState => ({ ...prevState, accessKeyId: e.target.value })); e.target.focus() }}
                                            required
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Secret Access Key</td>
                                    <td><input
                                        type="text"
                                        className="w-100"
                                        defaultValue={newAccount.secretAccessKey}
                                        minLength={8}
                                        onBlur={(e) => { setNewAccount(prevState => ({ ...prevState, secretAccessKey: e.target.value })) }} // Fix: Use string "secretAccessKey"
                                        required
                                    /></td>
                                </tr>
                            </tbody>
                        </table>
                    </CardBody>
                </form>
            </Card>
        ) : (
            <Card className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-xs-12 d-flex align-items-center">

                <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                    <h2 className="btn btn-success" onClick={() => { setAddCredentialActive(true) }}>
                        Add Credentials<br />
                        <i className="bi bi-terminal-plus h1"></i>
                    </h2>
                </div>
            </Card>
        );
    }

    return (
        <>
            <ProfileNavbar />
            <div className="d-flex row w-100 justify-content-center text-dark m-auto tilt-warp-title">
                <div className="d-grid row w-100 col-xl-10 col-lg-10 col-md-11 col-sm-12 col-xs-12 text-dark justify-content-start">
                    {accounts.map((account, index) => (
                        <CredentialCard
                            key={index} // Assuming index is a suitable key
                            cloud={account.cloud}
                            id={account.id} // Use id or another suitable property
                            accessKeyId={account.accessKeyId}
                            secretAccessKey={account.secretAccessKey}
                        />
                    ))}
                    <AddCredentialCard />
                </div>
            </div>
        </>
    );
}
