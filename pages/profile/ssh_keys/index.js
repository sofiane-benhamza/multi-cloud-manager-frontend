"use client"

import { useRouter } from "next/router";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { useEffect, useContext, useState } from "react";
import ProfileNavbar from '@/comps/ProfileNavbar.js'; // Importing the profile component
import { AuthContext } from "@/pages/_app";
import { getCredentials } from "@/utils/general";
import Image from "next/image";
export default function ProfileCredentials({ setWarning }) {
    const INIT = {
        newCloudAccount: {
            ssh: {
                id: "",
                file: null
            }
        }
    }
    const { token } = useContext(AuthContext);

    useEffect(() => {
        token &&
            getCredentials(token, setAccounts, true);
    }, [token]);

    const [addCredentialActive, setAddCredentialActive] = useState(false);
    const [accounts, setAccounts] = useState({ ssh: [{}] });  // many accounts,  mappable array of objects

    const [newCloudAccount, setNewCloudAccount] = useState(INIT.newCloudAccount)  // Unique account => object is enough


    // Passive Comps 

    const CredentialCard = ({ id, date }) => {

        return (
            <Card className="p-2 col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 my-2">
                <div className="my-0 border border-dark rounded overflow-hidden">
                    <CardHeader className="justify-between">
                        <div className="d-flex flex-row justify-content-left align-items-center gap-5">
                            <div>
                                <Image className="bg-light p-2" width={40} height={40} src={`/cloud/ssh.png`} alt="Logo" />
                            </div>
                            <div className="ml-3 d-flex flex-column align-items-left">
                                <span >SSH</span><br />
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



    const handleSSHKeyChange = (event) => {
        const uploadedFile = event.target.files[0];
        setNewCloudAccount({
            ssh: {
                id: "",
                file: uploadedFile
            }
        });
    };




    const submitCredential = async (e) => {
        e.preventDefault();


        try {
            const form = new FormData();
            form.append("token", token);
            form.append("cloud", "ssh");
            // check if valide also.
            if (newCloudAccount.ssh.file !== null) {
                form.append("file", newCloudAccount.ssh.file)
            } else {
                setWarning({
                    message: "No SSH Key file has been choosen",
                    type: "warning",
                    isShown: true
                })
                return
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
                    message: "Credentials saved succesfully",
                    type: "success",
                    isShown: true
                })
                // Each one has a different schem
                setAccounts((prev) => ({
                    ...prev,
                    ssh: [...prev.gcp, {
                        id: 'ssh-<refresh>',
                    }]
                }))


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
                const updatedAccounts = accounts.ssh.filter(item => item.id !== id);
                //setAccounts(prev => ({ ...prev, ssh: updatedAccounts }));

            } else {
                setWarning({
                    message: "Something went wrong, please try again later or contact support",
                    type: "danger",
                    isShown: true
                })
            }
        } catch (error) {
            console.error("something went wrong", error);
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
                                    SSH private Key
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

                            <table className="table text-dark">
                                <tbody>
                                    <tr>
                                        <td >service&nbsp;key</td>
                                        <td className="d-flex align-items-center">
                                            {newCloudAccount.ssh.file ?
                                                newCloudAccount.ssh.file.name
                                                :
                                                <label class="gcp-file-upload">
                                                    <i class="bi bi-cloud-upload mr-2"></i>
                                                    Upload
                                                    <input
                                                        type="file"
                                                        accept=".json,application/json"
                                                        onChange={handleSSHKeyChange}
                                                    />
                                                </label>
                                            }
                                        </td>
                                        {newCloudAccount.ssh.file &&
                                            <td>
                                                <i className="btn btn-secondary bi bi-trash"
                                                    onClick={() => {
                                                        setNewCloudAccount((prev) => ({ ...prev, ssh: { id: "", file: null } }))
                                                    }
                                                    }></i>
                                            </td>
                                        }
                                    </tr>
                                </tbody>
                            </table>
                            <a className="text-secondary cursor-pointer" href="https://stackoverflow.com/questions/77007581/how-to-create-a-new-ssh-key-pair-and-assign-it-to-an-ec2-instance-which-currentl" target="_blank">what is this ?</a>

                        </CardBody>
                    </form>
                </Card>
            </div>
        ) : (
            <Card className="p-2 col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 my-2">

                <div className="w-100 h-100 d-flex justify-content-center align-items-center mx-auto">
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
            <div className="d-flex flex-wrap my-5 row justify-content-center container text-dark mx-auto tilt-warp-title">
                <div className="d-flex justify-content-left flex-wrap w-100">


                    {accounts.ssh.map((account, index) => (
                        account.id && account.id.startsWith("ssh") &&
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



