import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getCredentials, wait } from "@/utils/general";
import { getVPCs, regions } from "@/utils/gcp";

export default function VPC({ setWarning, setToken }) {
    const { isConnected, token } = useContext(AuthContext);
    const router = useRouter();

    // State for filter and vpcs
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], vpcs: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((isOk) => {
            if (!isOk) setToken("expired")
        });;
    }, [token, setToken]);

    // Effect to fetch vpcs when filter changes
    useEffect(() => {
        if (filter.account && filter.region) {
            setFilter((prev) => ({ ...prev, vpcs: [{ id: wait, name: wait, autoCreateSubnets: wait, routingMode: wait }] }))
            getVPCs(token, filter.account, filter.region, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, vpcs: [{ id: "-", name: "-", autoCreateSubnets: "-", routingMode: "-" }] }))
                }
            });
        }
    }, [filter.account, filter.region, token, setWarning]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    // Handle VPC action <------
    const handleDeleteVPC = async (vpcName) => {

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}gcp/vpc/?` +
                new URLSearchParams({
                    token: token,
                    region: filter.region,
                    account: filter.account,
                    vpcName: vpcName
                }), {
                method: "DELETE",
            });
            if (response.ok) {
                const data = await response.json();
                setWarning({
                    message: "VPC deleted successfully ",
                    type: "success",
                    isShown: true
                })
                setFilter(prevConfig => ({ ...prevConfig, vpcs: filter.vpcs.filter(vpc => vpc.name !== vpcName) }))
            } else {
                setWarning({
                    message: "Something went wrong, please try again later or contact support [error : 876]",
                    type: "danger",
                    isShown: true
                })
            }
        } catch (error) {
            console.error("something went wrong");
        }
    };

    return (
        <div className="mt-5 tilt-warp-title">
            <div className="row justify-content-center">
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
                                    setFilter((prev) => ({ ...prev, vpcs: [{ id: wait, name: wait, autoCreateSubnets: wait, routingMode: wait }] }))
                                    getVPCs(token, filter.account, filter.region, setFilter)
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
                                            <th className="text-center">Auto Create Subnets</th>
                                            <th className="text-center">Routing Mode</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.vpcs.length > 0 ? (filter.vpcs.map((vpc, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{vpc.id}</td>
                                                <td className="text-center">{vpc.name}</td>
                                                <td className="text-center">{vpc.autoCreateSubnets !== wait ? vpc.autoCreateSubnets ? <i class="bi bi-check-circle"></i>:<i class="bi bi-x-circle"></i> : wait }</td>
                                                <td className="text-center">{vpc.routingMode}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Delete" onClick={() => handleDeleteVPC(vpc.name)} disabled={vpc.name === "default"}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))) : null}
                                        <tr className="bg-dark">
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td colSpan="4" className="px-2 w-100 btn btn-success" onClick={() => { router.push('./vpc/create'); }}>
                                                <i className="bi bi-cloud-plus p-2"></i>Create a VPC
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
