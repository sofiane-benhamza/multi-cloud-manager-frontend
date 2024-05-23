"use client"

import { useRouter } from "next/router";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { useEffect, useContext, useState } from "react";
import ProfileNavbar from '@/comps/ProfileNavbar.js'; // Importing the profile component
import { AuthContext } from "@/pages/_app";
import { getCredentials } from "@/utils/general";

export default function ProfileCredentials({ setWarning }) {
    const INIT = {
        newCloudAccount: {
            active: "aws",
            aws: {
                id: "",
                accessKeyId: "",
                secretAccessKey: ""
            },
            azure: {
                subscriptionId: "",
                clientId: "",
                clientSecret: "",
                tenantId: ""
            },
            gcp: {}
        }
    }
    const { token } = useContext(AuthContext);
    const router = useRouter();
    const [addCredentialActive, setAddCredentialActive] = useState(false);
    const [accounts, setAccounts] = useState({ aws: [{}], azure: [{}], gcp: [{}] });  // many accounts,  mappable array of objects

    const [newCloudAccount, setNewCloudAccount] = useState(INIT.newCloudAccount)  // Unique account => object is enough


    // Passive Comps 

    const AWSCredentialCard = ({ id, accessKeyId, secretAccessKey }) => {

        const srcOfLogo = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png";

        return (
            <Card className="mb-5 col-xl-3 col-lg-4 col-md-6 col-sm-12 col-xs-12">
                <div className="mx-2 border border-dark rounded">
                    <CardHeader className="justify-between">
                        <div className="d-flex flex-row justify-content-left align-items-center gap-5">
                            <div>
                                <img   className="bg-light p-2" width="40px" height="35px" src={srcOfLogo} alt="Logo" />
                            </div>
                            <div className="ml-3 m-0 d-flex flex-row align-items-center">
                                <div className="font-semibold leading-none font-weight-bolder baloo-da-beautiful">Amazon Web Services</div>
                            </div>
                            <button className="text-light ml-auto border bg-danger p-2 rounded"
                                disabled={id === "will be generated"}
                                onClick={() => { deleteCredential(id) }}>
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

    const AZURECredentialCard = ({ id, subscriptionId, clientId, clientSecret, tenantId }) => {

        const srcOfLogo = "https://static-00.iconduck.com/assets.00/microsoft-azure-icon-512x396-6fn0yfat.png";

        return (
            <Card className="mb-5 col-xl-3 col-lg-4 col-md-6 col-sm-12 col-xs-12">
                <div className="mx-2 border border-dark rounded">
                    <CardHeader className="justify-between">
                        <div className="d-flex flex-row justify-content-left align-items-center gap-5">
                            <div>
                                <img   className="bg-light p-2" width="40px" height="35px" src={srcOfLogo} alt="Logo" />
                            </div>
                            <div className="ml-3 m-0 d-flex flex-row align-items-center">
                                <div className="font-semibold leading-none font-weight-bolder baloo-da-beautiful">Microsoft Azure</div>
                            </div>
                            <button className="text-light ml-auto border bg-danger p-2 rounded" disabled={id === "will be generated"} onClick={() => { deleteCredential(id) }}>
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
                                    <td>Subscription ID</td>
                                    <td>{subscriptionId}</td>
                                </tr>
                                <tr>
                                    <td>Client ID</td>
                                    <td>{clientId}</td>
                                </tr>
                                <tr>
                                    <td>Client Secret</td>
                                    <td>{clientSecret}</td>
                                </tr>
                                <tr>
                                    <td>Tenant ID</td>
                                    <td>{tenantId}</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardBody>
                </div>
            </Card>
        );
    }



    const handleCloudChange = (cloud) => {
        setNewCloudAccount(prevState => ({
            ...prevState,
            active: cloud
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
            form.append("cloud", newCloudAccount.active);

            switch (newCloudAccount.active) {
                case "aws":
                    form.append("accessKeyId", newCloudAccount.aws.accessKeyId);
                    form.append("secretAccessKey", newCloudAccount.aws.secretAccessKey);
                    break;
                case "azure":
                    form.append("subscriptionId", newCloudAccount.azure.subscriptionId)
                    form.append("clientId", newCloudAccount.azure.clientId)
                    form.append("clientSecret", newCloudAccount.azure.clientSecret)
                    form.append("tenantId", newCloudAccount.azure.tenantId)
                    break;
                case "gcp":
                    // Handle GCP cloud account
                    break;
                default:
                    // Handle other cases or provide an error message
                    break;
            }

            const response = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_ADDR + "cloud/",
                {
                    method: "POST",
                    body: form,
                }
            );

            if (response.ok) {
                setWarning({
                    message: "Credentials saved succesfully" + newCloudAccount.active,
                    type: "success",
                    isShown: true
                })
                // Each one has a different scheme
                switch (newCloudAccount.active) {
                    case "aws":
                        setAccounts((prev) => ({
                            ...prev,
                            aws: [...prev.aws, {
                                id: 'will be generated',
                                accessKeyId: newCloudAccount.aws.accessKeyId.substring(1, 4) + "-XXXXXXX",
                                secretAccessKey: newCloudAccount.aws.secretAccessKey.substring(1, 4) + "-XXXXXXX",
                            }]
                        }))
                        break;
                    case "azure":
                        setAccounts((prev) => ({
                            ...prev,
                            azure: [...prev.azure, {
                                id: 'will be generated',
                                subscriptionId: newCloudAccount.azure.subscriptionId.substring(1, 4) + "-XXXXXXX",
                                clientId: newCloudAccount.azure.clientId.substring(1, 4) + "-XXXXXXX",
                                clientSecret: newCloudAccount.azure.clientSecret.substring(1, 4) + "-XXXXXXX",
                                tenantId: newCloudAccount.azure.tenantId.substring(1, 4) + "-XXXXXXX"
                            }]
                        }))
                        break;
                    case "gcp":
                        // Handle GCP cloud account
                        break;
                    default:
                        // Handle other cases or provide an error message
                        break;
                }


                // Return to origine of inputs
                setNewCloudAccount(INIT.newCloudAccount)
                setAddCredentialActive(false)

            } else {
                setWarning({
                    message: "Something went wrong, please try again later or contact support [error : 981]",
                    type: "danger",
                    isShown: true
                })
            }
        } catch (error) {
            console.error("something went wrong");
        }


    }

    const deleteCredential = async (id) => {
        try {
            const response = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_ADDR + "cloud/?" +
                new URLSearchParams({
                    token: token,
                    account: id,
                }),
                {
                    method: "DELETE",
                }
            );
            if (response.ok) {
                setWarning({
                    message: "Credentials deleted successfully",
                    type: "success",
                    isShown: true
                })

                // Filter out the item with the id that already deleted
                let cloudType;
                let updatedAccounts;

                if (id.startsWith("aws")) {
                    cloudType = "aws";
                } else if (id.startsWith("azure")) {
                    cloudType = "azure";
                } else { // GCP
                    cloudType = "gcp";
                }

                updatedAccounts = accounts[cloudType].filter(item => item.id !== id);
                // Update the state with the new object
                setAccounts(prev => ({ ...prev, [cloudType]: updatedAccounts }));

            } else {
                setWarning({
                    message: "Something went wrong, please try again later or contact support [error : 983]",
                    type: "danger",
                    isShown: true
                })
            }
        } catch (error) {
            console.error("something went wrong");
        }
    }

    const AddCredentialCard = () => {
        return addCredentialActive ? (
            <div className="vw-100 position-fixed m-0 p-0 d-flex justify-content-center" style={{ left: 0, top: "80px", zIndex: 10, height: "calc(100vh - 80px)", backdropFilter: "blur(8px)" }}>
                <Card className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-xs-12 d-flex justify-content-center align-items-center" >
                    <form className="border rounded w-100 bg-light" onSubmit={submitCredential}>
                        <CardHeader className="justify-between">
                            <div className="d-flex flex-row justify-content-left align-items-center gap-5">
                                <div className="m-0 d-flex flex-row align-items-center">
                                    <div className="form-check m-1">
                                        <input className="form-check-input" type="radio" name="cloud" id="aws" value="aws"
                                            onChange={(e) => handleCloudChange(e.target.value)}
                                            checked={newCloudAccount.active == "aws"} />
                                        <label className="form-check-label" htmlFor="aws">
                                            AWS
                                        </label>
                                    </div>
                                    <div className="form-check m-1">
                                        <input className="form-check-input" type="radio" name="cloud" id="azure" value="azure"
                                            onChange={(e) => handleCloudChange(e.target.value)}
                                            checked={newCloudAccount.active == "azure"} />
                                        <label className="form-check-label" htmlFor="azure">
                                            AZURE
                                        </label>
                                    </div>
                                    <div className="form-check m-1">
                                        <input className="form-check-input" type="radio" name="cloud" id="gcp" value="gcp"
                                            onChange={(e) => handleCloudChange(e.target.value)}
                                            checked={newCloudAccount.active == "gcp"} />
                                        <label className="form-check-label" htmlFor="gcp">
                                            GCP
                                        </label>
                                    </div>
                                </div>
                                <button className="text-dark ml-auto border bg-success p-2 rounded" title="submit credentials" type="submit">
                                    <i className="bi bi-bookmark-plus"></i>
                                </button>
                                <button className="text-dark ml-1 border bg-danger p-2 rounded" title="close" onClick={() => { setAddCredentialActive(false) }}>
                                    <i className="bi bi-x"></i>
                                </button>
                            </div>
                        </CardHeader>
                        <CardBody className="overflow-visible d-flex flex-column justify-content-center">

                            {newCloudAccount.active == "aws" &&
                                <>
                                    <table className="table text-dark">
                                        <tbody>
                                            <tr>
                                                <td>Access Key ID</td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="w-100"
                                                        defaultValue={newCloudAccount.aws.accessKeyId}
                                                        minLength={8}
                                                        onBlur={(e) => { setNewCloudAccount(prevState => ({ ...prevState, aws: { ...prevState.aws, accessKeyId: e.target.value } })); e.target.focus() }}
                                                        required
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Secret Access Key</td>
                                                <td><input
                                                    type="text"
                                                    className="w-100"
                                                    defaultValue={newCloudAccount.aws.secretAccessKey}
                                                    minLength={8}
                                                    onBlur={(e) => { setNewCloudAccount(prevState => ({ ...prevState, aws: { ...prevState.aws, secretAccessKey: e.target.value } })); e.target.focus() }}
                                                    required
                                                /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <a className="text-secondary cursor-pointer" href="https://stackoverflow.com/questions/21440709/how-do-i-get-aws-access-key-id-for-amazon" target="_blank">where to get those ?</a>
                                </>
                            }

                            {newCloudAccount.active == "azure" &&
                                <>
                                    <table className="table text-dark">
                                        <tbody>
                                            <tr>
                                                <td>Subscription ID</td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="w-100"
                                                        defaultValue={newCloudAccount.azure.subscriptionId}
                                                        minLength={8}
                                                        onBlur={(e) => { setNewCloudAccount(prevState => ({ ...prevState, azure: { ...prevState.azure, subscriptionId: e.target.value } })); e.target.focus() }}
                                                        required
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Client ID</td>
                                                <td><input
                                                    type="text"
                                                    className="w-100"
                                                    defaultValue={newCloudAccount.azure.clientId}
                                                    minLength={8}
                                                    onBlur={(e) => { setNewCloudAccount(prevState => ({ ...prevState, azure: { ...prevState.azure, clientId: e.target.value } })); e.target.focus() }}
                                                    required
                                                /></td>
                                            </tr>
                                            <tr>
                                                <td>Client Secret</td>
                                                <td><input
                                                    type="text"
                                                    className="w-100"
                                                    defaultValue={newCloudAccount.azure.clientSecret}
                                                    minLength={8}
                                                    onBlur={(e) => { setNewCloudAccount(prevState => ({ ...prevState, azure: { ...prevState.azure, clientSecret: e.target.value } })); e.target.focus() }}
                                                    required
                                                /></td>
                                            </tr>
                                            <tr>
                                                <td>Tenant ID</td>
                                                <td><input
                                                    type="text"
                                                    className="w-100"
                                                    defaultValue={newCloudAccount.azure.tenantId}
                                                    minLength={8}
                                                    onBlur={(e) => { setNewCloudAccount(prevState => ({ ...prevState, azure: { ...prevState.azure, tenantId: e.target.value } })); e.target.focus() }}
                                                    required
                                                /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <a className="text-secondary cursor-pointer" href="https://learn.microsoft.com/en-us/azure/developer/terraform/authenticate-to-azure?tabs=bash" target="_blank">where to get those ?</a>

                                </>
                            }

                        </CardBody>
                    </form>
                </Card>
            </div>
        ) : (
            <Card className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-xs-12 my-5 py-5 d-flex align-items-center">

                <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                    <h2 className="btn btn-success"
                        onClick={() => {
                            setAddCredentialActive(true);
                        }}>
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
                    {accounts.aws.map((account, index) => (
                        account.id &&
                        <AWSCredentialCard
                            key={index} // Assuming index is a suitable key
                            cloud={account.cloud}
                            id={account.id}
                            accessKeyId={account.accessKeyId}
                            secretAccessKey={account.secretAccessKey}
                        />
                    ))}
                </div>
                <div className="d-grid row w-100 col-xl-10 col-lg-10 col-md-11 col-sm-12 col-xs-12 text-dark justify-content-start">
                    {accounts.azure.map((account, index) => (
                        account.id &&
                        <AZURECredentialCard
                            key={index} // Assuming index is a suitable key
                            id={account.id}
                            subscriptionId={account.subscriptionId}
                            clientId={account.clientId}
                            clientSecret={account.clientSecret}
                            tenantId={account.tenantId}
                        />
                    ))}
                    <AddCredentialCard />
                </div>
            </div>
        </>
    );
}



