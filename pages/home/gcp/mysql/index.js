import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getCredentials, wait } from "@/utils/general";
import { regions, getSQLs } from "@/utils/gcp";

export default function EC2({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // State for filter and instances
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], instances: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((ok) => {
            if (!ok) {
                setToken("expired")
            }
        });
    }, [token, setToken]);

    // Effect to fetch EC2 instances when filter changes
    useEffect(() => {
        if (filter.account && filter.region) {
            setFilter((prev) => ({ ...prev, instances: [{ name: wait, id: wait, status: wait, size: wait, privateIp: wait, gbs: wait }] }))
            getSQLs(token, filter.account, filter.region, setFilter, "MYSQL").then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, instances: [{ name: "-", id: "-", status: "-", size: "-", privateIp: "-", gbs: "-" }] }))
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
    const handleDBAction = async (action, id) => {
        const actionConfig = new FormData();

        actionConfig.append("token", token);
        actionConfig.append("account", filter.account);
        actionConfig.append("action", action)
        actionConfig.append("instanceId", id);


        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}gcp/sql/`, {
                method: "PUT",   //update
                body: actionConfig,
            });
            if (response.ok) {
                setWarning({
                    message: `action ${action} has been applied on ${id}  successfully`,
                    type: "success",
                    isShown: true
                })
                setFilter(prev => ({
                    ...prev,
                    instances: prev.instances.map(instance => {
                        if (instance.name === id) {
                            return { ...instance, status: "pending", gbs: "N/A" };
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
                                            name.startsWith("gcp") &&
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
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => {
                                    setFilter((prev) => ({ ...prev, instances: [{ name: wait, id: wait, status: wait, size: wait, privateIp: wait, gbs: wait }] }))
                                    getSQLs(token, filter.account, filter.region, setFilter, "MYSQL")
                                }} disabled={!(filter.account && filter.region)}>
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
                                            <th className="text-center">Backend Type</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(filter.instances.map((instance, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{instance.id}</td>
                                                <td className="text-center">{instance.name}</td>
                                                <td className="text-center">{instance.size}</td>
                                                <td className="text-center">
                                                    {instance.status === "RUNNABLE" ? (
                                                        <span className="text-success">Running</span>
                                                    ) : instance.status === "stopped" ? (
                                                        <span className="text-danger">terminated</span>
                                                    ) : instance.status === "TERMINATED" ? (
                                                        <span className="text-dark">stopped</span>
                                                    ) : (
                                                        <span>{instance.status}</span>
                                                    )}
                                                </td>

                                                <td className="text-center">{instance.privateIp}</td>
                                                <td className="text-center">{instance.gbs}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-success" title="Start" disabled={instance.status !== "TERMINATED"} onClick={() => { handleDBAction("start", instance.name) }}>
                                                        <i className="bi bi-play-fill"></i>
                                                    </button>
                                                    <button className="btn mx-1 btn-dark" title="Shutdown" disabled={instance.status !== "RUNNABLE"} onClick={() => { handleDBAction("stop", instance.name) }}>
                                                        <i className="bi bi-sign-stop"></i>
                                                    </button>
                                                    <button className="btn mx-1 btn-danger" title="Terminate" disabled={instance.status !== "TERMINATED" && instance.status !== "RUNNABLE"} onClick={() => { handleDBAction("terminate", instance.name) }}>
                                                        <i className="bi bi-x-circle"></i>
                                                    </button>
                                                </td>

                                            </tr>
                                        )))}
                                        <tr className="bg-dark">
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2 w-100 btn btn-success" onClick={() => { router.push('./mysql/create'); }}><i className="bi bi-cloud-plus p-2"></i>Create a MySQL DB</td>
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

