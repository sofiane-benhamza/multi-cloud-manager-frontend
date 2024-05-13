import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getS3s, regions } from "@/utils/aws";
import { getCredentials, wait } from "@/utils/general";

export default function S3({ setWarning }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    // State for filter and vpcs
    const [filter, setFilter] = useState({ account: "", region: "", accounts: [], s3s: [] });

    // Effect to fetch account names when component mounts
    useEffect(() => {
        getCredentials(token, setFilter).then((isOk) => {
            if (!isOk) setToken("expired")
        });;
    }, [token]);

    // Effect to fetch vpcs when filter changes
    useEffect(() => {
        if (filter.account && filter.region) {
            setFilter((prevFilter) => ({ ...prevFilter, s3s: [{ name: wait, storedObjects: wait }] }))
            getS3s(token, filter.region, filter.account, setFilter).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                    setFilter((prevFilter) => ({ ...prevFilter, s3s: [{ name: "-", storedObjects: "-" }] }))
                }
            });
        }
    }, [filter.account, filter.region]);

    // Handle input change for filter
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
    };

    // Handle S3 action <------
    const handleDeleteS3 = async (bucket) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/s3/?` +
                new URLSearchParams({
                    token: token,
                    region: filter.region,
                    uniqueName: filter.account,
                    bucketName: bucket
                }), {
                method: "DELETE",
            });

            if (response.ok) {
                setWarning({
                    message: "bucket deleted successfully",
                    type: "success",
                    isShown: true
                })
                setFilter(prevConfig => ({ ...prevConfig, s3s: filter.s3s.filter(s3 => s3['name'] !== bucket) }))
            } else {
                setWarning({
                    message: "something went wrong, please try again later or contact support, [error : 941] ",
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
                                <div className="col-md-4">
                                    <label htmlFor="region" className="form-label">Region</label><br />
                                    <select
                                        id="region"
                                        name="region"
                                        value={filter.region}
                                        className="form-select w-50 bg-light border-0"
                                        onChange={handleInputChange}
                                    >
                                        <option value="" defaultValue disabled>Choose a region</option>
                                        {regions.map((region, index) => (
                                            <option key={index} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>
                                <button className="border border-dark rounded d-flex align-items-center ml-auto mr-3 px-3 btn btn-light" onClick={() => { getS3s(token, filter.region, filter.account, setFilter) }} disabled={!(filter.account && filter.region)}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Number of objects</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filter.s3s.length > 0 ? (filter.s3s.map((bucket, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{bucket['name']}</td>
                                                <td className="text-center">{bucket['storedObjects']}</td>
                                                <td className="text-center">
                                                    <button className="btn mx-1 btn-danger" title="Delete" onClick={() => handleDeleteS3(bucket['name'])} disabled={bucket['storedObjects'] == '-'}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))) : null
                                        }
                                        <tr className="bg-dark">
                                            <td></td>
                                            <td></td>
                                            <td colSpan="4" className="px-2 w-100 btn btn-success" onClick={() => { router.push('./s3/create'); }}>
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
