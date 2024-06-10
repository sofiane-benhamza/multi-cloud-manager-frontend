import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getCredentials, wait } from "@/utils/general";
import { getVMs, getSQLs, locations } from "@/utils/azure";


export default function SQL({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // state for filter and vms
    const [filter, setFilter] = useState({ account: "", location: "", accounts: [], sqls: [] });

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
            setFilter((prev) => ({ ...prev, sqls: [{ resourceGroup: wait, id: wait, dbName: wait, serverName: wait, type: wait, status: wait }] }))
            getSQLs(token, filter.account, filter.location, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, sqls: [{ resourceGroup: "-", id: "-", dbName: "-", serverName: "-", type: "-", status: "-" }] }))
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
    const handleSQLAction = async (dbId) => {
        setWarning({
            message: `We will let you know when its done.`,
            type: "immediate",
            isShown: true
        })

        const actionConfig = new FormData();

        actionConfig.append("token", token);
        actionConfig.append("account", filter.account);
        actionConfig.append("id", dbId);
        //actionConfig.append("resourceGroup", resourceGroup);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/sqls/`, {
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
                    sqls: prev.sqls.map(sql => {
                        if (sql.id === dbId) {
                            return { ...sql, status: "pending" };
                        }
                        return sql;
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
                                    setFilter((prev) => ({ ...prev, sqls: [{ resourceGroup: wait, id: wait, dbName: wait, serverName: wait, type: wait, status: wait }] }));
                                    getVMs(token, filter.account, filter.location, setFilter)
                                }} disabled={!(filter.account && filter.location)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">Resource Group</th>
                                            <th className="text-center">Server</th>
                                            <th className="text-center">Database</th>
                                            <th className="text-center">Type</th>
                                            <th className="text-center">Status</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(filter.sqls.map((sql, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{sql.resourceGroup}</td>
                                                <td className="text-center">{sql.serverName}</td>
                                                <td className="text-center">{sql.dbName}</td>
                                                <td className="text-center">{sql.type}</td>

                                                <td className="text-center">
                                                    {sql.status == "Online" ? <span className="text-success">Online</span> : <span>{sql.status}</span>}
                                                </td>

                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Terminate" disabled={sql.status !== "Online" || sql.dbName == "master"} onClick={() => { handleSQLAction(sql.id) }}>
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
                                            <td className="px-2 w-100 btn btn-success" onClick={() => { router.push('./sql/create'); }}><i className="bi bi-cloud-plus p-2"></i>Create an SQL database</td>
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

