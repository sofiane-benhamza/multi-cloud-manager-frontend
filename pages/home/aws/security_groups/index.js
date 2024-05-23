import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getSecurityGroups, regions } from "@/utils/aws";
import { getCredentials, wait } from "@/utils/general";

export default function SecurityGroup({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();


    const [terminalOutput, setTerminalOutput] = useState("");

    // State for filter and vpcs
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], securityGroups: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((isOk) => {
            if (!isOk) {
                setToken("expired")
            }
        });;
    }, [token, setToken]);

    // Effect to fetch vpcs when filter changes
    useEffect(() => {
        setFilter((prevFilter) => ({ ...prevFilter, securityGroups: [] }))
        if (filter.account && filter.region) {
            setFilter(prev => ({ ...prev, securityGroups: [{ groupId: wait, groupName: wait, vpcId: wait }] }))
            getSecurityGroups(token, filter.region, filter.account, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter(prev => ({ ...prev, securityGroups: [{ groupId: "-", groupName: "-", vpcId: "-" }] }))
                }
            });
        }
    }, [filter.account, filter.region, token, setWarning]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    // Handle SG action <------
    const handleDeleteSecurityGroup = async (sGId) => {
        const actionConfig = new FormData();

        actionConfig.append("token", token);
        actionConfig.append("region", filter.region);
        actionConfig.append("uniqueName", filter.account);


        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/security_group/?` +
                new URLSearchParams({
                    token: token,
                    region: filter.region,
                    uniqueName: filter.account,
                    securityGroupId: sGId

                }), {
                method: "DELETE",
            });
            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Security group deleted succesfully",
                    type: "success",
                    isShown: true
                })
                setTerminalOutput(data.stdOut);
            } else {
                setWarning({
                    message: "Something went wrong, please try again later or contact support [error : 929]",
                    type: "warning",
                    isShown: true
                })
                setTerminalOutput(data.stdErr);

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
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => { getSecurityGroups(token, filter.region, filter.account, setFilter) }} disabled={!(filter.account && filter.region)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">ID</th>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">VPC</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.securityGroups.length > 0 ? (filter.securityGroups.map((sG, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{sG['groupId']}</td>
                                                <td className="text-center">{sG['groupName']}</td>
                                                <td className="text-center">{sG['vpcId']}</td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn mx-1 btn-danger"
                                                        title="Delete"
                                                        onClick={() => handleDeleteSecurityGroup(sG['groupId'])}
                                                        disabled={(sG['groupName'] == "default")}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))) : null}
                                        <tr className="bg-dark">
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td className="px-2 w-100 btn btn-success" onClick={() => { router.push('./security_groups/create'); }}>
                                                <i className="bi bi-cloud-plus p-2"></i>Create a Security group
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
