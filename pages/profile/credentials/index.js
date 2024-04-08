"use client"

import { useRouter } from "next/router";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { useEffect, useContext, useState } from "react";
import ProfileNavbar from '../../../comps/ProfileNavbar.js'; // Importing the profile component
import { FullContext } from "../../_app";

export default function profileCredentials() {
    const { isConnected, token } = useContext(FullContext);
    const router = useRouter();
    const [addCredentialActive, setAddCredentialActive] = useState(false);
    const [secretAccessKey, setSecretAccessKey] = useState("");
    const [accessKeyId, setAccessKeyId] = useState("");
    const [cloud, setCloud] = useState("aws");
    const [accounts, setAccounts] = useState([]);


    const handleCloudChange = (cloud) => {
        setCloud(cloud);
    }

    const submitCredential = async () => {
        if (secretAccessKey.length < 4 || accessKeyId.length < 4 || cloud.length < 2) {
            alert("Please enter your information correctly!");
            return;
        }

        try {
            const form = new FormData();
            form.append("token", token);
            form.append("accessKeyId", accessKeyId);
            form.append("secretAccessKey", secretAccessKey);
            form.append("cloud", cloud)
            const response = await fetch(
                "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/cloud/",
                {
                    method: "POST",
                    body: form,
                }
            );

            if (response.ok) {
                const data = await response.json();
                alert("Saved succesfully");
                setAccounts([...accounts, {
                    id: 'will be generated',
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey,
                    cloud: cloud
                }])
            } else {
                const errorData = await response.json();
                alert("something went wrong 826 : " + errorData.error);
            }
        } catch (error) {
            console.error("somethin went wrong 986 :", error.message);
        }


    }

    const getCredentials = async () => {
        try {
            const response = await fetch(
                "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/cloud/?token=" + token,
                {
                    method: "GET",
                }
            );
            const data = await response.json();
            const accounts = data.map(item => ({
                id: item.uniqueName,
                accessKeyId: item.accessKeyId,
                secretAccessKey: item.secretAccessKey,
                cloud: item.cloud
            }));
            setAccounts(accounts);
        } catch (error) {
            alert("something went wrong")
        }
    }
    useEffect(() => {
        const getAccounts = async () => {
            await getCredentials();
        };
        getAccounts();
    }, []);

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
                alert("credentials deleted successfully");
                // Filter out the item with the id to delete
                const updatedAccounts = accounts.filter(item => item.id !== id);
                // Update the state with the new array
                setAccounts(updatedAccounts);
            } else {
                alert("something went wrong ... 564")
            }
        } catch (error) {
            alert("something went wrong")
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
            <Card key={index} style={{ height: "300px" }} className="mb-5  col-lg-3 col-md-4 col-sm-12 col-xs-12">
                <div className="mx-2 border border-dark rounded">
                    <CardHeader className="justify-between">
                        <div className="d-flex flex-row justify-content-left align-items-center gap-5">
                            <div>
                                <img className="bg-light p-2" width="40px" height="35px" src={srcOfLogo} alt="Logo" />
                            </div>
                            <div className="ml-3 m-0 d-flex flex-row align-items-center">
                                <div className="text-small font-semibold leading-none">{name}</div>
                            </div>
                            <button className="text-light ml-auto border bg-danger p-2 rounded" onClick={() => { if( id !== "will be generated" ){deleteCredential(id) }}}>
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
            <Card className="mb-5 col-lg-3 col-md-4 col-sm-12 col-xs-12 d-flex align-items-center">
                <div className="mx-2 border rounded">
                    <CardHeader className="justify-between">
                        <div className="d-flex flex-row justify-content-left align-items-center gap-5">
                            <div className="3 m-0 d-flex flex-row align-items-center">
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
                            <button className="text-dark ml-auto border bg-success p-2 rounded" onClick={() => submitCredential()}>
                                <i className="bi bi-bookmark-plus"></i>
                            </button>
                        </div>
                    </CardHeader>

                    <CardBody className="overflow-visible d-flex flex-column justify-content-center">
                        <table className="table text-dark">
                            <tbody>
                                <tr>
                                    <td>Access Key ID</td>
                                    <td><input type="text" className="w-100" defaultValue={accessKeyId} onBlur={(e) => {let newValue=e.target.value;setAccessKeyId(newValue); e.target.value=newValue;}} /></td>
                                </tr>
                                <tr>
                                    <td>Secret Access Key</td>
                                    <td><input type="text" className="w-100" defaultValue={secretAccessKey} onBlur={(e) => {let newValue=e.target.value;setSecretAccessKey(newValue);e.target.value=newValue}} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </CardBody>
                </div>
            </Card>
        ) : (
            <Card className="mb-5 col-lg-3 col-md-4 col-sm-12 col-xs-12 d-flex align-items-center">

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
            <div className="d-flex row w-100 justify-content-center text-dark m-auto">
                <div className="d-grid row w-100 col-xl-10 col-lg-10 text-dark justify-content-start">
                    {accounts.map((account, index) => (
                        <CredentialCard
                            key={index} // Assuming index is a suitable key
                            cloud={account.cloud}
                            id={account.id} // Use id or another suitable property
                            accessKeyId={account.accessKeyId}
                            secretAccessKey={account.secretAccessKey}
                            index={index}
                        />
                    ))}
                    <AddCredentialCard />
                </div>
            </div>
        </>
    );
}
