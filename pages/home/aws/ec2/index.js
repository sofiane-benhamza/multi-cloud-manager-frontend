import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import {  getEC2s, regions } from "@/utils/aws";
import { getCredentials, wait } from "@/utils/general";

export default function EC2({ setWarning, setToken}) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // State for filter and instances
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], instances: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((ok) => {
            if(!ok){
                setToken("expired")
            }
        });
    }, [token, setToken]);

    // Effect to fetch EC2 instances when filter changes
    useEffect(() => {
        if (filter.account && filter.region) {
            setFilter((prev) => ({ ...prev, instances: [{ name: wait, id: wait, state:wait, size: wait, privateIp: wait, publicIp: wait }] }))
            getEC2s(token, filter.account, filter.region, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, instances: [{ name: "-", id: "-", state:"-", size: "-", privateIp: "-", publicIp: "-" }] }))
                }
            });

        }
    }, [filter.account, filter.region, setWarning, token]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    //handle actions
    const handleEC2Action = async (action, eC2Id) => {
        const actionConfig = new FormData();

        actionConfig.append("token", token);
        actionConfig.append("uniqueName", filter.account);
        actionConfig.append("region", filter.region);
        actionConfig.append("eC2Id", eC2Id);
        actionConfig.append("action", action)


        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/ec2/`, {
                method: "PUT",   //update
                body: actionConfig,
            });
            if (response.ok) {
                setWarning({
                    message: `action ${action} has been applied on instance ${filter.instances.find(instance => instance.id === eC2Id)?.name || null}  successfully`,
                    type: "success",
                    isShown: true
                })
                setFilter(prev => ({
                    ...prev,
                    instances: prev.instances.map(instance => {
                        if (instance.id === eC2Id) {
                            return { ...instance, state: "pending", publicIp: "N/A" };
                        }
                        return instance;
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
                                            name.startsWith("aws") &&
                                                <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 col-sm-5">
                                    <label htmlFor="region" className="form-label">Region</label><br />
                                    <select
                                        id="region"
                                        name="region"
                                        value={filter.region}
                                        className="form-select bg-light border-0"
                                        onChange={handleInputChange}
                                    >
                                        <option value="" disabled>Choose a region</option>
                                        {regions.map((region, index) => (
                                            <option key={index} value={region}>{region}</option>
                                        ))}

                                    </select>
                                </div>
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => { getEC2s(token, filter.account, filter.region, setFilter) }} disabled={!(filter.account && filter.region)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">ID</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Size</th>
                                            <th className="text-center">State</th>
                                            <th className="text-center">Private&nbsp;IP</th>
                                            <th className="text-center">Public&nbsp;IP</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.instances.length > 0 ? (filter.instances.map((instance, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{instance.id}</td>
                                                <td className="text-center">{instance.name}</td>
                                                <td className="text-center">{instance.size}</td>
                                                <td className="text-center">
                                                    {instance.state === "running" ? (
                                                        <span className="text-success">running</span>
                                                    ) : instance.state === "stopped" ? (
                                                        <span className="text-dark">stopped</span>
                                                    ) : instance.state === "terminated" ? (
                                                        <span className="text-danger">terminated</span>
                                                    ) : (
                                                        <span>{instance.state}</span>
                                                    )}
                                                </td>

                                                <td className="text-center">{instance.privateIp}</td>
                                                <td className="text-center">{instance.publicIp}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-success" title="Start" disabled={instance.state !== "stopped"} onClick={() => { handleEC2Action("start", instance.id) }}>
                                                        <i className="bi bi-play-fill"></i>
                                                    </button>
                                                    <button className="btn mx-1 btn-dark" title="Shutdown" disabled={instance.state !== "running"} onClick={() => { handleEC2Action("shutdown", instance.id) }}>
                                                        <i className="bi bi-sign-stop"></i>
                                                    </button>
                                                    <button className="btn mx-1 btn-danger" title="Terminate" disabled={instance.state !== "running" && instance.state !== "stopped"} onClick={() => { handleEC2Action("terminate", instance.id) }}>
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
                                            <td className="px-2 w-100 btn btn-success" onClick={() => { router.push('./ec2/create'); }}><i className="bi bi-cloud-plus p-2"></i>Create an EC2</td>
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

