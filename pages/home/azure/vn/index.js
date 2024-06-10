import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getCredentials, wait } from "@/utils/general";
import { getVNs, locations } from "@/utils/azure";


export default function VN({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // state for filter and vms
    const [filter, setFilter] = useState({ account: "", location: "", accounts: [], vns: [] });

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
            setFilter((prev) => ({ ...prev, vns: [{ resourceGroup: wait, name: wait, id: wait, mask: wait, cidrBlock: wait }] }))
            getVNs(token, filter.account, filter.location, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, vns: [{ resourceGroup: "-", name: "-", id: "-", mask: "-", cidrBlock: "-" }] }))
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
    const handleDeleteVN = async (vnetId) => {

        setWarning({
            message: `We will let you know when its done.`,
            type: "immediate",
            isShown: true
        })

        const actionConfig = new FormData();

        actionConfig.append("token", token);
        actionConfig.append("account", filter.account);
        actionConfig.append("vnetId", vnetId);


        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/vns/?` + new URLSearchParams({
                    token: token,
                    account: filter.account,
                    vnetId: vnetId
                }), {
                method: "DELETE",   //update
            });
            if (response.ok) {
                setWarning({
                    message: `Virtual Network has been deleted succesfully`,
                    type: "success",
                    isShown: true
                })
                setFilter(prev => ({
                    ...prev,
                    vns: prev.vns.filter(vn => vn.id != vnetId)
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
                                    setFilter((prev) => ({ ...prev, vns: [{ resourceGroup: wait, name: wait, id: wait, mask: wait, cidrBlock: wait }] }));
                                    getVNs(token, filter.account, filter.location, setFilter) }} disabled={!(filter.account && filter.location)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">Resource Group</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Network</th>
                                            <th className="text-center">Mask</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.vns.map((vn, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{vn.resourceGroup}</td>
                                                <td className="text-center">{vn.name}</td>
                                                <td className="text-center">{vn.cidrBlock}</td>
                                                <td className="text-center">{vn.mask}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Terminate" disabled={vn.cidrBlock == "-"} onClick={() => { handleDeleteVN(vn.id) }}>
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
                                            <td className="px-2 w-100 btn btn-success" onClick={() => { router.push('./vn/create'); }}><i className="bi bi-cloud-plus p-2"></i>Create an Virtual Network</td>
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

