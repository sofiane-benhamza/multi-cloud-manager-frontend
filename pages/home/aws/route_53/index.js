import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getRoute53Domains } from "@/utils/aws";
import { getCredentials, wait } from "@/utils/general";

export default function Route53({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // State for filter and domains
    const [filter, setFilter] = useState({ account: "", accounts: [], domains: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((ok) => {
            if (!ok) {
                setToken("expired")
            }
        });
    }, []);

    // Effect to fetch EC2 domains when filter changes
    useEffect(() => {
        if (filter.account) {
            setFilter((prev) => ({ ...prev, domains: [{ domain: wait, id: wait, privateZone: wait, recordCount: wait }] }))
            getRoute53Domains(token, filter.account, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, domains: [{ domain: "-", id: "-", privateZone: "-", recordCount: "-" }] }))
                }
            });

        }
    }, [filter.account]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    //handle actions
    const FreeRoute53 = async (action, eC2Id) => {
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
                    message: `action ${action} has been applied on domain ${filter.domains.find(domain => domain.id === eC2Id)?.name || null}  successfully`,
                    type: "success",
                    isShown: true
                })
                setFilter(prev => ({
                    ...prev,
                    domains: prev.domains.map(domain => {
                        if (domain.id === eC2Id) {
                            return { ...domain, state: "pending", publicIp: "N/A" };
                        }
                        return domain;
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
                                            name.startsWith("aws") &&
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => { getRoute53Domains(token, filter.account, setFilter) }} disabled={!(filter.account)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">ID</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">visit</th>
                                            <th className="text-center">Private Zone</th>
                                            <th className="text-center">Record Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.domains.length > 0 ? (filter.domains.map((domain, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{domain.id}</td>
                                                <td className="text-center">{domain.domain}</td>
                                                <td className="text-center"><button disabled={domain.id == "-"} className="btn btn-dark"><a href={"https://www." + domain.domain} className="bi bi-box-arrow-up-right" target="_blank"></a></button> </td>
                                                <td className="text-center">{domain.privateZone ? "yes" : "no"}</td>
                                                <td className="text-center">{domain.recordCount}</td>


                                            </tr>
                                        ))) : null}
                                        <tr className="bg-dark">
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
                                            <td className="px-2">{ }</td>
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

