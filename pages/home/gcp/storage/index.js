import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { regions, getStorages } from "@/utils/gcp";
import { getCredentials, wait } from "@/utils/general";

export default function Storage({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // State for filter and vpcs
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], buckets: [{}] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((isOk) => {
            if (!isOk) setToken("expired")
        });;
    }, [token, setToken]);

    // Effect to fetch vpcs when filter changes
    useEffect(() => {
        if (filter.account && filter.region) {
            setFilter((prevFilter) => ({ ...prevFilter, buckets: [{ name: wait, storageClass: wait, created: wait, selfLink: wait }] }))
            getStorages(token, filter.account, filter.region, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prevFilter) => ({ ...prevFilter, buckets: [{ name: "-", storageClass: "-", created: "-", selfLink: "-" }] }))
                }
            });
        }
    }, [filter.account, filter.region, token, setWarning]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    // Handle bucket action <------
    const handleDeletebucket = async (bucketName) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}gcp/storage/?` +
                new URLSearchParams({
                    token: token,
                    account: filter.account,
                    bucketName: bucketName
                }), {
                method: "DELETE",
            });

            if (response.ok) {
                setWarning({
                    message: "bucket deleted successfully",
                    type: "success",
                    isShown: true
                })
                setFilter(prevConfig => ({ ...prevConfig, buckets: filter.buckets.filter((bucket) => {return bucket['name'] != bucketName}) }))
            } else if (response.status == 409) {
                setWarning({
                    message: "This bucket is not empty.",
                    type: "warning",
                    isShown: true
                })
            } else {
                setWarning({
                    message: "something went wrong, please try again later or contact support.",
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
                                    setFilter((prevFilter) => ({ ...prevFilter, buckets: [{ name: wait, storageClass: wait, created: wait, selfLink: wait }] }))
                                    getStorages(token, filter.account, filter.region, setFilter)
                                }} disabled={!(filter.account && filter.region)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Storage Class</th>
                                            <th className="text-center">Created</th>
                                            <th className="text-center">Link</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.buckets.length > 0 && filter.buckets.map((bucket, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{bucket['name']}</td>
                                                <td className="text-center">{bucket['storageClass']}</td>
                                                <td className="text-center">{bucket['created']}</td>
                                                <td className="text-center">{bucket['selfLink']}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Delete" onClick={() => handleDeletebucket(bucket['name'])} disabled={!bucket['created'] || bucket['created'] === '-'}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        <tr className="bg-dark">
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td colSpan="4" className="px-2 w-100 btn btn-success" onClick={() => { router.push('./storage/create'); }}>
                                                <i className="bi bi-cloud-plus p-2"></i>Create a Bucket
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
