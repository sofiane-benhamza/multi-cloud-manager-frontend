import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getVPCs, regions } from "@/utils/aws";
import { getCredentials, wait } from "@/utils/general";

export default function VPC({ setWarning, setToken }) {
    const { isConnected, token } = useContext(AuthContext);
    const router = useRouter();

    // State for filter and vpcs
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], vPCs: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((isOk) => {
            if (!isOk) setToken("expired")
        });;
    }, []);

    // Effect to fetch vpcs when filter changes
    useEffect(() => {
        if (filter.account && filter.region) {
            setFilter((prev) => ({ ...prev, vPCs: [{ "VPC ID": wait, "Name": wait, "CIDR Block": wait }] }))
            getVPCs(token, filter.region, filter.account, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prev) => ({ ...prev, vPCs: [{ "VPC ID": "-", "Name": "-", "CIDR Block": "-" }] }))
                }
            });
        }
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
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/vpc/?` +
                new URLSearchParams({
                    token: token,
                    region: filter.region,
                    uniqueName: filter.account,
                    vPCId: vPCId
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
                setFilter(prevConfig => ({ ...prevConfig, vPCs: filter.vPCs.filter(vPC => vPC['VPC ID'] !== vPCId) }))
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
                                                <td className="text-center">{typeof vPC['CIDR Block'] === "string" ? vPC['CIDR Block'].split('/')[0] : vPC['CIDR Block']}</td>
                                                <td className="text-center">{typeof vPC['CIDR Block'] === "string" ? vPC['CIDR Block'].split('/')[1] : vPC['CIDR Block']}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Delete" onClick={() => handleDeleteVPC(vPC['VPC ID'])} disabled={vPC['Name'] === "default"}>
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
