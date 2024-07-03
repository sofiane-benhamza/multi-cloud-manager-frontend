"use client"

import { useRouter } from "next/router";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import React, { useEffect, useContext, useState } from "react";
import ProfileNavbar from '@/comps/ProfileNavbar.js'; // Importing the profile component
import { AuthContext } from "@/pages/_app";
import { getCredentials, wait } from "@/utils/general";
import Image from "next/image";
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
                id: "",
                subscriptionId: "",
                clientId: "",
                clientSecret: "",
                tenantId: ""
            },
            git: {
                id: "",
                gitToken: ""
            },
            gcp: {
                id: "",
                file: null
            }
        }
    }
    const { token } = useContext(AuthContext);
    const [waitCard, setWaitCard] = useState(
        <button className="btn btn-light border-light btn-lg m-5 p-5">
            <div className="spinner-border text-primary" style={{ fontSize: "40px" }} role="status">
                <span className="visually-hidden"></span>
            </div>
        </button>
    )

    useEffect(() => {
        token &&
            getCredentials(token, setAccounts, true).then((ok) => {
                setWaitCard(<></>)
            });
    }, [token]);

    const [addCredentialActive, setAddCredentialActive] = useState(false);
    const [accounts, setAccounts] = useState({ aws: [{}], azure: [{}], gcp: [{}], git: [{}] });  // many accounts,  mappable array of objects

    const [newCloudAccount, setNewCloudAccount] = useState(INIT.newCloudAccount)  // Unique account => object is enough


    // Passive Comps 

    const CredentialCard = ({ id, date }) => {
        let n = 3
        if (id.charAt(1) == 'z') n = 5;
        name = id.substring(0, n)

        return (
            <Card className="p-2 col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 my-3 overflow-visible">
                <div className="my-0 border border-dark rounded shadow down-to-up">
                    <CardHeader className="justify-between">
                        <div className="d-flex flex-row justify-content-left align-items-center gap-5">
                            <div>
                                <Image className="bg-light p-2" width={40} height={40} src={`/cloud/${name}/logo.png`} alt="Logo" />
                            </div>
                            <div className="ml-3 d-flex flex-column align-items-left">
                                <span >{name.toUpperCase()}</span><br />
                                <span className="small text-secondary">{date}</span>
                            </div>
                            <button className="text-light ml-auto border bg-danger p-2 rounded"
                                disabled={id === "refresh"}
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
                            </tbody>
                        </table>
                    </CardBody>
                </div>
            </Card>
        );
    }



    const handleGCPFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        setNewCloudAccount(prevState => ({
            ...prevState,
            gcp: {
                id: "",
                file: uploadedFile
            }
        }));
    };


    const handleCloudChange = (cloud) => {
        setNewCloudAccount(prevState => ({
            ...prevState,
            active: cloud
        }))
    }



    const submitCredential = async (e) => {
        e.preventDefault();


        try {
            const form = new FormData();
            form.append("token", token);
            form.append("cloud", newCloudAccount.active);
            // check if valide also.
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
                case "git":
                    form.append("gitToken", newCloudAccount.git.gitToken)
                    break;
                case "gcp":
                    if (newCloudAccount.gcp.file !== null) {
                        form.append("file", newCloudAccount.gcp.file)
                    } else {
                        setWarning({
                            message: "No GCP credentials file has been choosen",
                            type: "warning",
                            isShown: true
                        })
                        return
                    }
                    break;
                default:
                    // Handle other cases or provide an error message
                    break;
            }

            console.warn(form)

            const response = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_ADDR + "cloud/",
                {
                    method: "POST",
                    body: form,
                }
            );

            if (response.ok) {
                setWarning({
                    message: "Credentials saved succesfully",
                    type: "success",
                    isShown: true
                })
                // Each one has a different scheme
                switch (newCloudAccount.active) {
                    case "aws":
                        setAccounts((prev) => ({
                            ...prev,
                            aws: [...prev.aws, {
                                id: 'aws-<refresh>',
                            }]
                        }))
                        break;
                    case "azure":
                        setAccounts((prev) => ({
                            ...prev,
                            azure: [...prev.azure, {
                                id: 'azure-<refresh>',
                            }]
                        }))
                        break;
                    case "gcp":
                        setAccounts((prev) => ({
                            ...prev,
                            gcp: [...prev.gcp, {
                                id: 'gcp-<refresh>',
                            }]
                        }))
                        break;
                    case "git":
                        setAccounts((prev) => ({
                            ...prev,
                            git: [...prev.git, {
                                id: 'git-<refresh>',
                            }]
                        }))
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
                    message: "Something went wrong, please try again later or contact support.",
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
                } else if (id.startsWith("git")) { // GCP
                    cloudType = "git";
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
                <Card className="col-xl-3 col-lg-4 col-md-6 col-sm-12 d-flex justify-content-center align-items-center" >
                    <form className="border rounded w-100" onSubmit={submitCredential} style={{ backgroundColor: "rgba(255,255,255,0.7)" }}>
                        <CardHeader className="justify-between user-select-none w-100  border p-0 m-0">
                            <div className="d-flex justify-content-left p-2 align-items-center">
                                <div className="m-0 d-flex flex-row align-items-center">
                                    <select
                                        className="form-select mx-1"
                                        name="cloud"
                                        value={newCloudAccount.active}
                                        onChange={(e) => handleCloudChange(e.target.value)}
                                    >
                                        <option value="aws">AWS</option>
                                        <option value="azure">Azure</option>
                                        <option value="git">Git</option>
                                        <option value="gcp">GCP</option>
                                    </select>
                                </div>
                                <button
                                    className="text-dark ml-auto border bg-success p-3 rounded-circle icon-cercle"
                                    title="Submit Credentials"
                                    type="submit"
                                >
                                    <i class="bi bi-plus"></i>
                                </button>
                                <button
                                    type="button"
                                    className="text-dark ml-1 border bg-warning p-3 rounded-circle icon-cercle"
                                    title="Please note that we don't check those credentials till you use them."
                                >
                                    <i className="bi bi-question"></i>
                                </button>
                                <button
                                    className="text-dark ml-1 border bg-danger p-3 rounded-circle icon-cercle"
                                    title="Close"
                                    onClick={() => { setAddCredentialActive(false) }}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            </div>
                        </CardHeader>
                        <CardBody className="overflow-visible d-flex flex-column justify-content-center  overflow-hidden">

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
                            {newCloudAccount.active == "gcp" &&
                                <>
                                    <table className="table text-dark">
                                        <tbody>
                                            <tr>
                                                <td >service&nbsp;key</td>
                                                <td className="d-flex align-items-center">
                                                    {newCloudAccount.gcp.file ?
                                                        newCloudAccount.gcp.file.name
                                                        :
                                                        <label class="gcp-file-upload">
                                                            <i class="bi bi-cloud-upload mr-2"></i>
                                                            Upload
                                                            <input
                                                                type="file"
                                                                accept=".json,application/json"
                                                                onChange={handleGCPFileChange}
                                                            />
                                                        </label>
                                                    }
                                                </td>
                                                {newCloudAccount.gcp.file &&
                                                    <td>
                                                        <i className="btn btn-secondary bi bi-trash"
                                                            onClick={() => {
                                                                setNewCloudAccount((prev) => ({ ...prev, gcp: { id: "", file: null } }))
                                                            }
                                                            }></i>
                                                    </td>
                                                }
                                            </tr>
                                        </tbody>
                                    </table>
                                    <small className="alert alert-warning mx-2"><i className="bi bi-exclamation-triangle mr-2"></i>Don&apos;t forget to enable Google cloud APIs you need.</small>
                                    <a className="text-secondary cursor-pointer" href="https://cloud.google.com/iam/docs/keys-create-delete" target="_blank">where to get those ?</a>
                                </>

                            }

                            {newCloudAccount.active == "git" &&
                                <>
                                    <table className="table text-dark">
                                        <tbody>
                                            <tr>
                                                <td>Git token</td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="w-100"
                                                        defaultValue={newCloudAccount.git.gitToken}
                                                        minLength={8}
                                                        onBlur={(e) => { setNewCloudAccount(prevState => ({ ...prevState, git: { gitToken: e.target.value } })); e.target.focus() }}
                                                        required
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <a className="text-secondary cursor-pointer" href="https://docs.github.com/en/enterprise-server@3.9/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens" target="_blank">where to get those ?</a>
                                </>
                            }

                        </CardBody>
                    </form>
                </Card>
            </div>
        ) : (
            <Card className="p-2 col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 my-2">

                <div className="w-100 h-100 d-flex justify-content-center align-items-center mx-auto">
                    <h2 className="btn btn-success shadow-lg"
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
            <div className="d-flex flex-wrap my-5 row justify-content-center container text-dark mx-auto tilt-warp-title">
                <div className="d-flex justify-content-left flex-wrap w-100">

                            {waitCard}

                    {accounts.azure.map((account, index) => (
                        account.id &&
                        <CredentialCard
                            key={index}
                            id={account.id}
                            date={account.date}
                        />
                    ))}
                    {accounts.aws.map((account, index) => (
                        account.id &&
                        <CredentialCard
                            key={index}
                            cloud={account.cloud}
                            id={account.id}
                            date={account.date}
                        />
                    ))}
                    {accounts.git.map((account, index) => (
                        account.id &&
                        <CredentialCard
                            key={index}
                            id={account.id}
                            date={account.date}
                        />
                    ))}
                    {accounts.gcp.map((account, index) => (
                        account.id &&
                        <CredentialCard
                            key={index}
                            id={account.id}
                            date={account.date}
                        />
                    ))}

                    <AddCredentialCard />
                </div>

            </div>
        </>
    );
}



