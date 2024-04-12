import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { FullContext } from "../../../_app";
import { getCredentials, getEC2s, regions } from "../../../../utils/functions";

export default function EC2({ setWarning }) {
    const { token } = useContext(FullContext);
    const router = useRouter();

    // State for filter and instances
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], instances: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter);
    }, []);

    // Effect to fetch EC2 instances when filter changes
    useEffect(() => {
        if (filter.account && filter.region) {
            getEC2s(token, filter.account, filter.region, setFilter);

        }
    }, [filter.account, filter.region]);

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
                `http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/aws/ec2/`, {
                method: "PUT",   //update
                body: actionConfig,
            });
            if (response.ok) {
                setWarning({
                    message: `instance ${instances.filter(instance => {instance,id == eC2Id}).name} has been ${action}ed successfully,`,
                    type: "success",
                    isShown: true
                })
            }else{
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
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <label htmlFor="account" className="form-label">Account</label><br />
                                    <select
                                        id="account"
                                        name="account"
                                        value={filter.account}
                                        className="form-select w-50 bg-light border-0"
                                        onChange={handleInputChange}
                                    >
                                        <option value="" disabled>Choose an account</option>
                                        {filter.accounts.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="region" className="form-label">Region</label><br />
                                    <select
                                        id="region"
                                        name="region"
                                        value={filter.region}
                                        className="form-select w-50 bg-light border-0"
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
                                            <th className="text-center">Name</th>
                                            <th className="text-center">ID</th>
                                            <th className="text-center">Size</th>
                                            <th className="text-center">State</th>
                                            <th className="text-center">Private&nbsp;IP</th>
                                            <th className="text-center">Public&nbsp;IP</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.instances.map((instance, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{instance.name}</td>
                                                <td className="text-center">{instance.id}</td>
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
                                        ))}
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

