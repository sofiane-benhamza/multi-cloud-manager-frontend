import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getCredentials, wait } from "@/utils/general";
import { getResourceGroups, locations } from "@/utils/azure";


export default function VM({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // state for filter and vms
    const [filter, setFilter] = useState({ account: "", location: "", accounts: [], resourceGroups: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((ok) => {
            if (!ok)
                setToken("expired")
        });
    }, []);

    // Effect to fetch VMS when filter changes
    useEffect(() => {
        if (filter.account && filter.location) {
            setFilter((prev) => ({ ...prev, resourceGroups: [{ id: wait, rgName: wait, managedBy: wait }] }))
            getResourceGroups(token, filter.account, filter.location, setFilter, true).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, resourceGroups: [{ resourceGroup: "-", name: "-", status: "-", size: "-", privateIp: "-", publicIp: "-" }] }))
                }
            });

        }
    }, [filter.account, filter.location]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    //handle actions
    const handleRGDelete = async (rgId) => {


        setWarning({
            message: `We will let you know when its done.`,
            type: "immediate",
            isShown: true
        })

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/resource_groups/?` + new URLSearchParams({
                    token: token,
                    account: filter.account,
                    resourceGroupId: rgId
                }), {
                method: "DELETE",
            });
            if (response.ok) {
                setWarning({
                    message: `Resource group and all its content has been deleted succesfully`,
                    type: "success",
                    isShown: true
                })
                setFilter(prev => ({
                    ...prev,
                    resourceGroups: prev.resourceGroups.filter(rg => rg.id !== rgId)
                }));


            } else {
                setWarning({
                    message: "something went wrong, please try again later or contact support, [error : 721] ",
                    type: "danger",
                    isShown: true
                })
            }
        } catch (error) {
            console.error("something went wrong");
        }
    }

    return (
        <div className="mt-5">
            <div className="row justify-content-center tilt-warp-title h6">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex flex-row mb-4">
                                <div className="col-lg-3 col-md-4 col-sm-5">
                                    <label htmlFor="account" className="form-label">Account</label><br />
                                    <select
                                        id="account"
                                        name="account"
                                        value={filter.account}
                                        className="form-select bg-light border-0"
                                        onChange={handleInputChange}
                                    >
                                        <option value="" disabled>Choose an account</option>
                                        {filter.accounts.map(name => (
                                            name.startsWith("azure") &&
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 col-sm-5">
                                    <label htmlFor="location" className="form-label">location</label><br />
                                    <select
                                        id="location"
                                        name="location"
                                        value={filter.location}
                                        className="form-select bg-light border-0"
                                        onChange={handleInputChange}
                                    >
                                        <option value="" disabled>Choose a location</option>
                                        {locations.map((location, index) => (
                                            <option key={index} value={location}>{location}</option>
                                        ))}

                                    </select>
                                </div>
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => { getResourceGroups(token, filter.account, filter.location, setFilter, true) }} disabled={!(filter.account && filter.location)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">ID</th>
                                            <th className="text-center">Resource Group</th>
                                            <th className="text-center">Managed By</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.resourceGroups.map((rg, index) => ((
                                            <tr key={index}>
                                                <td className="text-center">{rg.id}</td>
                                                <td className="text-center">{rg.rgName}</td>
                                                <td className="text-center">{rg.managedBy ? rg.managedBy : "N/A"}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Terminate" disabled={rg.rgName == "-"} onClick={() => { handleRGDelete(rg.id) }}>
                                                        <i className="bi bi-x-circle"></i>
                                                    </button>
                                                </td>

                                            </tr>
                                        )))}
                                        <tr className="bg-dark">
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2 w-100 btn btn-success" onClick={() => { router.push('./rg/create'); }}><i className="bi bi-cloud-plus p-2"></i>Create a Resource Group</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

