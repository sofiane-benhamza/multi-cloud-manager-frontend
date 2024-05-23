import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getCredentials, wait } from "@/utils/general";
import { getWebApps, locations } from "@/utils/azure";


export default function WebApp({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // state for filter and webApps
    const [filter, setFilter] = useState({ account: "", location: "", accounts: [], webApps: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((ok) => {
            if (!ok)
                setToken("expired")
        });
    }, []);

    // Effect to fetch webApps when filter changes
    useEffect(() => {
        if (filter.account && filter.location) {
            setFilter((prev) => ({ ...prev, webApps: [{ resourceGroup: wait, id: "-", name: wait, hostname: wait, repository: wait }] }))
            getWebApps(token, filter.account, filter.location, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, webApps: [{ resourceGroup: "-", id: "-", name: "-", hostname: "-", repository: "-" }] }))
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
    const handleDeleteWebApp = async (webAppId) => {
        setWarning({
            message: `We will let you know when its done.`,
            type: "immediate",
            isShown: true
        })

        const actionConfig = new FormData();

        actionConfig.append("token", token);
        actionConfig.append("account", filter.account);
        actionConfig.append("webAppId", webAppId);


        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/web_apps/`, {
                method: "PUT",   //update
                body: actionConfig,
            });
            if (response.ok) {
                setWarning({
                    message: `action ${action} has been applied on webApp ${webAppName}  successfully`,
                    type: "success",
                    isShown: true
                })
                setFilter(prev => ({
                    ...prev,
                    webApps: prev.webApps.map(webApp => {
                        if (webApp.name === webAppName) {
                            return { ...webApp, status: "pending", publicIp: "N/A" };
                        }
                        return webApp;
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
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => { getWebApps(token, filter.account, filter.location, setFilter) }} disabled={!(filter.account && filter.location)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">Resource Group</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">URL</th>
                                            <th className="text-center">Repository</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.webApps.map((webApp, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{webApp.resourceGroup}</td>
                                                <td className="text-center">{webApp.name}</td>
                                                <td className="text-center" title={webApp.hostname} ><button disabled={webApp.id == "-"} class="btn btn-dark"><a href={"https://" + webApp.hostname} className="bi bi-box-arrow-up-right" target="_blank"></a></button></td>
                                                <td className="text-center" title={webApp.repository} ><button disabled={!webApp.repository} class="btn btn-dark"><a href={webApp.repository} className="bi bi-box-arrow-up-right" target="_blank"></a></button></td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Terminate" disabled={webApp.id == "-"} onClick={() => { handleDeleteWebApp(webApp.id) }}>
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
                                            <td className="px-2 w-100 btn btn-success" onClick={() => { router.push('./static_web_app/create'); }}><i className="bi bi-cloud-plus p-2"></i>Create a Static Web App</td>
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

