import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getCredentials, wait } from "@/utils/general";
import { getVMs, locations } from "@/utils/azure";


export default function VM({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // state for filter and vms
    const [filter, setFilter] = useState({ account: "", location: "", accounts: [], vms: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((ok) => {
            if (!ok)
                setToken("expired")
        });
    }, [token, setToken]);

    // Effect to fetch VMS when filter changes
    useEffect(() => {
        if (filter.account && filter.location) {
            setFilter((prev) => ({ ...prev, vms: [{ resourceGroup: wait, name: wait, status: wait, size: wait, privateIp: wait, publicIp: wait }] }))
            getVMs(token, filter.account, filter.location, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, vms: [{ resourceGroup: "-", name: "-", status: "-", size: "-", privateIp: "-", publicIp: "-" }] }))
                }
            });

        }
    }, [filter.account, filter.location, token, setWarning]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    //handle actions
    const handleVMAction = async (action, vmName, resourceGroup) => {

        setWarning({
            message: `We will let you know when its done.`,
            type: "immediate",
            isShown: true
        })

        const actionConfig = new FormData();

        actionConfig.append("token", token);
        actionConfig.append("account", filter.account);
        actionConfig.append("name", vmName);
        actionConfig.append("action", action);
        actionConfig.append("resourceGroup", resourceGroup);


        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/vms/`, {
                method: "PUT",   //update
                body: actionConfig,
            });
            if (response.ok) {
                setWarning({
                    message: `action ${action} has been applied on vm ${vmName}  successfully`,
                    type: "success",
                    isShown: true
                })
                setFilter(prev => ({
                    ...prev,
                    vms: prev.vms.map(vm => {
                        if (vm.name === vmName) {
                            return { ...vm, status: "pending", publicIp: "N/A" };
                        }
                        return vm;
                    })
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
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => { 
                                    setFilter((prev) => ({ ...prev, vms: [{ resourceGroup: wait, name: wait, status: wait, size: wait, privateIp: wait, publicIp: wait }] }));
                                    getVMs(token, filter.account, filter.location, setFilter) }} disabled={!(filter.account && filter.location)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">Resource Group</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Size</th>
                                            <th className="text-center">Status</th>
                                            <th className="text-center">Private&nbsp;IP</th>
                                            <th className="text-center">Public&nbsp;IP</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.vms.length > 0 ? (filter.vms.map((vm, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{vm.resourceGroup}</td>
                                                <td className="text-center">{vm.name}</td>
                                                <td className="text-center">{vm.size}</td>
                                                <td className="text-center">
                                                    {vm.status == "VM running" ? <span className="text-success">running</span> :
                                                        vm.status == "VM deallocated" ? <span className="text-dark">stopped</span> : <span>{vm.status}</span>}
                                                </td>

                                                <td className="text-center">{vm.privateIp}</td>
                                                <td className="text-center">{vm.publicIp}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-success" title="Start" disabled={vm.status !== "VM deallocated"} onClick={() => { handleVMAction("start", vm.name, vm.resourceGroup) }}>
                                                        <i className="bi bi-play-fill"></i>
                                                    </button>
                                                    <button className="btn mx-1 btn-dark" title="Shutdown" disabled={vm.status !== "VM running"} onClick={() => { handleVMAction("stop", vm.name, vm.resourceGroup) }}>
                                                        <i className="bi bi-sign-stop"></i>
                                                    </button>
                                                    <button className="btn mx-1 btn-danger" title="Terminate" disabled={vm.status !== "VM running" && vm.status !== "VM deallocated"} onClick={() => { handleVMAction("terminate", vm.name, vm.resourceGroup) }}>
                                                        <i className="bi bi-x-circle"></i>
                                                    </button>
                                                </td>

                                            </tr>
                                        ))) : null}
                                        <tr className="bg-dark">
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2 w-100 btn btn-success" onClick={() => { router.push('./vm/create'); }}><i className="bi bi-cloud-plus p-2"></i>Create an VM</td>
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

