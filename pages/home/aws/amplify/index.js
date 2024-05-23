import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getAmplifyApps, regions } from "@/utils/aws";
import { getCredentials, wait } from "@/utils/general";

export default function AmplifyApp({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // State for filter and instances
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], applications: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((ok) => {
            if (!ok) {
                setToken("expired")
            }
        });
    }, [token, setToken]);

    // Effect to fetch applications when filter changes
    useEffect(() => {
        if (filter.account && filter.region) {
            setFilter((prev) => ({ ...prev, applications: [{ name: wait, id: wait, repository: wait, technology: wait }] }))
            getAmplifyApps(token, filter.account, filter.region, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, applications: [{ name: "-", id: "-", repository: "-", technology: "-" }] }))
                }
            });

        }
    }, [filter.account, filter.region, token, setWarning]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    //handle actions
    const handleAmplifyAppDelete = async (appId) => {

        try {
            const response = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_ADDR + "aws/amplify/?" + new URLSearchParams({
                    token: token,
                    account: filter.account,
                    region: filter.region,
                    appId: appId

                }), {
                method: "DELETE",
            });

            if (response.ok) {
                setWarning({
                    message: `the application ${filter.applications.find(application => application.id === appId)?.name || null} has been deleted successfully`,
                    type: "success",
                    isShown: true
                })
                setFilter(prev => ({
                    ...prev,
                    applications: prev.applications.map(application => {
                        if (application.id === appId) {
                            return { name: "-", id: "-", repository: "-", technology: "-" };
                        }
                        return application;
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
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => { getAmplifyApps(token, filter.account, filter.region, setFilter) }} disabled={!(filter.account && filter.region)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">ID</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">repository</th>
                                            <th className="text-center">visit</th>
                                            <th className="text-center">technology</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.applications.length > 0 ? (filter.applications.map((application, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{application.id}</td>
                                                <td className="text-center">{application.name}</td>
                                                <td className="text-center" title={application.repository} ><button disabled={application.id == "-"} class="btn btn-dark"><a href={application.repository} className="bi bi-box-arrow-up-right" target="_blank"></a></button></td>
                                                <td className="text-center" title={application.defaultDomain} ><button disabled={application.id == "-"} class="btn btn-dark"><a href={"https://"+application.defaultDomain} className="bi bi-box-arrow-up-right" target="_blank"></a></button></td>
                                                <td className="text-center">{application.technology}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Terminate" disabled={application.id == "-"} onClick={() => { handleAmplifyAppDelete(application.id) }}>
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
                                            <td className="px-2 w-100 btn btn-success" onClick={() => { router.push('./amplify/create'); }}><i className="bi bi-cloud-plus p-2"></i>Deploy an application</td>
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

