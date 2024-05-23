import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getECSs, regions } from "@/utils/aws";
import { getCredentials, wait } from "@/utils/general";

export default function ECS({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // State for filter and instances
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], clusters: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((isOk) => {
            if (!isOk) setToken("expired")
        });
    }, []);

    // Effect to fetch EC2 instances when filter changes
    useEffect(() => {
        if (filter.account && filter.region) {
            setFilter((prev) => ({ ...prev, clusters: [{ clusterName: wait, tasks: [wait], services: [wait], containerInstances: [wait] }] }))
            getECSs(token, filter.account, filter.region, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, clusters: [{ clusterName: "-", tasks: ["-"], services: ["-"], containerInstances: ["-"] }] }))
                }
            });

        }
    }, [filter.account, filter.region]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    //handle actions
    const deleteCluster = async (clusterName) => {
        if (!clusterName) return
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/ecs/?` + new URLSearchParams({
                    token: token,
                    uniqueName: filter.account,
                    region: filter.region,
                    clusterName: clusterName
                }), {
                method: "DELETE",
            });
            if (response.ok) {
                setWarning({
                    message: `cluster ${clusterName} deleted successfully`,
                    type: "success",
                    isShown: true
                })
                setFilter(prev => ({
                    ...prev,
                    clusters: prev.clusters.map(cluster => {
                        if (cluster.clusterName === clusterName) {
                            return [];
                        }
                        return cluster;
                    })
                }));

            } else {
                setWarning({
                    message: "something went wrong, please try to shutdown all services and tasks [error : 725] ",
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
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => { getECSs(token, filter.account, filter.region, setFilter) }} disabled={!(filter.account && filter.region)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Tasks</th>
                                            <th className="text-center">Services</th>
                                            <th className="text-center">Container instances</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.clusters.length > 0 ? filter.clusters.map((cluster, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{cluster.clusterName}</td>
                                                <td className="text-center">{cluster.tasks.map((task, index) => (
                                                    <p key={index}>
                                                        {task}
                                                    </p>
                                                ))}</td>
                                                <td className="text-center">{cluster.services.map((service, index) => (
                                                    <p key={index}>
                                                        {service}
                                                    </p>
                                                ))}</td>
                                                <td className="text-center">{cluster.containerInstances.map((containerInstance, index) => (
                                                    <p key={index}>
                                                        {containerInstance}
                                                    </p>))
                                                }
                                                </td>

                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Terminate" disabled={cluster.clusterName != ""} onClick={() => { deleteCluster(cluster.clusterName) }}>
                                                        <i className="bi bi-x-circle"></i>
                                                    </button>
                                                </td>

                                            </tr>
                                        )) : null}
                                        <tr className="bg-dark">
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2 w-100 btn btn-success" onClick={() => { router.push('./ecs/create'); }}><i className="bi bi-cloud-plus p-2"></i>Create a cluster</td>
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

