import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { FullContext } from "../../../_app";
import { getCredentials, getVPCs, regions } from "../../../../utils/functions";

export default function VPC() {
    const { isConnected, token } = useContext(FullContext);
    const router = useRouter();

    // State for filter and vpcs
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], vPCs: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter);
    }, []);

    // Effect to fetch vpcs when filter changes
    useEffect(() => {
        if (filter.account && filter.region)
            getVPCs(token, filter.region, filter.account, setFilter)
    }, [filter.account, filter.region]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    // Handle VPC action <------
    const handleDeleteVPC = async (vPCId) => {
        const actionConfig = new FormData();

        actionConfig.append("token", token);
        actionConfig.append("region", filter.region);
        actionConfig.append("uniqueName", filter.account);
        actionConfig.append("vPCId", vPCId);

        try {
            const response = await fetch(
                `http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/aws/vpc/`, {
                method: "DELETE",
                body: actionConfig,
            });
            if (!response.ok) throw new Error(`Failed to apply action on VPC: ${response.status}`);
            const data = await response.json();
            alert("Action successfully applied");
            setFilter(prevConfig => ({ ...prevConfig, vPCs: filter.vPCs.filter(vPC => vPC['VPC ID'] !== vPCId) }))
        } catch (error) {
            console.error("Failed to apply action on VPC:", error);
            alert("Something went wrong... Please try again.");
        }
    };

    return (
        <div className="mt-5">
            <div className="row justify-content-center">
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
                                        <option value="" defaultValue disabled>Choose an installation region</option>
                                        {regions.map((region, index) => (
                                            <option key={index} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => { getVPCs(token, filter.region, filter.account, setFilter) }} disabled={!(filter.account && filter.region)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">ID</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Network Address</th>
                                            <th className="text-center">Mask</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.vPCs.length > 0 ? (filter.vPCs.map((vPC) => (
                                            <tr key={vPC['VPC ID']}>
                                                <td className="text-center">{vPC['VPC ID']}</td>
                                                <td className="text-center">{vPC['Name']}</td>
                                                <td className="text-center">{vPC['CIDR Block'].split('/')[0]}</td>
                                                <td className="text-center">{vPC['CIDR Block'].split('/')[1]}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Delete" onClick={() => handleDeleteVPC(vPC['VPC ID'])} disabled={vPC['Name'] === "default"}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))) : (
                                            <tr>
                                                <td>There is no VPCs</td>
                                                <td className="text-center">-</td>
                                                <td className="text-center">-</td>
                                                <td className="text-center">-</td>
                                                <td className="text-center">-</td>
                                            </tr>
                                        )}
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
