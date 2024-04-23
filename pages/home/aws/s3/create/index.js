import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { FullContext } from "../../../../_app";
import { getCredentials, regions, separation } from "../../../../../utils/functions";

export default function CreateS3({ setWarning, setToken }) {
    const { token } = useContext(FullContext);
    const router = useRouter();

    const [terminalOutput, setTerminalOutput] = useState("");

    const INIT = {
        bucket: {
            account: "",
            region: "",
            bucketName: "",
            publicAccess: "0000"
        }, disabled: {
            region: true,
            bucketName: true,
        }
    }
    // VPC configuration
    const [bucket, setBucket] = useState(INIT.bucket)

    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState(INIT.disabled)
    // Disable Create button 
    const bucketConfigIsComplete = () => {
        return Object.values(bucket).every(val => val !== null && val !== '');
    }

    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>);


    // Items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
    })

    //reference of input of keyname
    useEffect(() => { // Call get credentials
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) setToken("expired")
        });;
    }, []);

    // Can not be optimized cause, calling functions time to time
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case "account":
                setBucket(INIT.bucket)
                setDisabled(INIT.disabled)
                setBucket(prevConfig => ({
                    ...prevConfig,
                    account: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    region: false
                }));
                break;
            case "region":
                setBucket(prevConfig => ({
                    ...prevConfig,
                    region: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    bucketName: false
                }));
                break;
            case "name":
                setBucket(prevConfig => ({
                    ...prevConfig,
                    bucketName: value
                }))
                break;
            default:
                break;
        }
    };

    const handleCreateS3 = async (e) => {
        e.preventDefault();
        setCreateButtonContent(
            <span>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait
            </span>
        );
        try {
            const bucketConfig = new FormData();
            bucketConfig.append("token", token); //token authentication

            for (const [key, value] of Object.entries(bucket)) {
                if (value.includes(' ')) {
                    setWarning({
                        message: "Bucket name must not contain whitespaces !",
                        type: "warning",
                        isShown: true
                    });
                    return;
                }
                bucketConfig.append(key, value);
            }

            const response = await fetch(
                "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/terraform/aws/s3/",
                {
                    method: "POST",
                    body: bucketConfig,
                }
            );

            if (!response.ok) {
                setWarning({
                    message: "Something went wrong, please check bucket name, try again or contact support [error : 736]",
                    type: "success",
                    isShown: true
                });
                const data = await response.json();
                setTerminalOutput(data.stdErr);
                return;
            }

            const data = await response.json();
            setWarning({
                message: "Your bucket has been created successfully",
                type: "success",
                isShown: true
            });
            setTerminalOutput(data.stdOut);
        } catch (error) {
            console.error("Something went wrong:", error);
            setWarning({
                message: "Something went wrong. Please try again later.",
                type: "error",
                isShown: true
            });
        } finally {
            setCreateButtonContent(<span>Create</span>);
        }
    };

    return (
        <div className=" d-flex align-items-center justify-content-center p-5 tilt-warp-title">
            <div className="row d-flex justify-content-center align-items-center col-xl-4 col-lg-4 col-md-5 col-sm-10 col-xs-12">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
                    <div
                        className="bg-transparent text-dark rounded"
                    >
                        <div className="card-body p-md-5 ">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <form onSubmit={handleCreateS3}>
                                        <h3 className="text-center h3 mb-3 mx-1 mx-md-4">
                                            create an S3 bucket
                                        </h3>

                                        <label className="form-label">
                                            Account
                                        </label>
                                        <select
                                            type="text"
                                            id="account"
                                            name="account"
                                            value={bucket.account}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        > <option value="" defaultValue disabled>choose an existant account</option>
                                            {chooseFrom.accounts.map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            Region
                                        </label>
                                        <select
                                            type="text"
                                            id="region"
                                            name="region"
                                            value={bucket.region}
                                            disabled={disabled.region}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose an installation Region</option>
                                            {regions.map((region, index) => (
                                                <option key={index} value={region}>{region}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            Name
                                        </label>

                                        <input type="text"
                                            id="name"
                                            name="name"
                                            value={bucket.bucketName}
                                            onChange={handleInputChange}
                                            minLength={6}
                                            maxLength={64}
                                            placeholder="my-dev-bucket"
                                            disabled={disabled.bucketName}
                                            className="form-select w-100 bg-light border-0"
                                            required
                                        />
                                        <br />
                                        <br />
                                        <input
                                            type="checkbox"
                                            style={{ accentColor: "black" }}
                                            className="my-3"
                                            disabled={disabled.bucketName}
                                            onChange={(event) => {
                                                setBucket((prevState) => {
                                                    const updatedPublicAccess = prevState.publicAccess.split(""); // Convert to array
                                                    updatedPublicAccess[0] = event.target.checked ? "1" : "0"; // Update character based on checked state
                                                    return {
                                                        ...prevState,
                                                        publicAccess: updatedPublicAccess.join("") // Join back to string
                                                    };
                                                });
                                            }}
                                        /> <span className="mx-2">Block public ACLs</span>
                                        <br />
                                        <input
                                            type="checkbox"
                                            style={{ accentColor: "black" }}
                                            className="my-3"
                                            disabled={disabled.bucketName}
                                            onChange={(event) => {
                                                setBucket((prevState) => {
                                                    const updatedPublicAccess = prevState.publicAccess.split(""); // Convert to array
                                                    updatedPublicAccess[1] = event.target.checked ? "1" : "0"; // Update character based on checked state
                                                    return {
                                                        ...prevState,
                                                        publicAccess: updatedPublicAccess.join("") // Join back to string
                                                    };
                                                });
                                            }}
                                        /> <span className="mx-2">Block public policy</span>
                                        <br />
                                        <input
                                            type="checkbox"
                                            style={{ accentColor: "black" }}
                                            className="my-3"
                                            disabled={disabled.bucketName}
                                            onChange={(event) => {
                                                setBucket((prevState) => {
                                                    const updatedPublicAccess = prevState.publicAccess.split(""); // Convert to array
                                                    updatedPublicAccess[2] = event.target.checked ? "1" : "0"; // Update character based on checked state
                                                    return {
                                                        ...prevState,
                                                        publicAccess: updatedPublicAccess.join("") // Join back to string
                                                    };
                                                });
                                            }}
                                        /> <span className="mx-2">Ignore public ACLs</span>
                                        <br />
                                        <input
                                            type="checkbox"
                                            style={{ accentColor: "black" }}
                                            className="my-3"
                                            disabled={disabled.bucketName}
                                            onChange={(event) => {
                                                setBucket((prevState) => {
                                                    const updatedPublicAccess = prevState.publicAccess.split(""); // Convert to array
                                                    updatedPublicAccess[3] = event.target.checked ? "1" : "0"; // Update character based on checked state
                                                    return {
                                                        ...prevState,
                                                        publicAccess: updatedPublicAccess.join("") // Join back to string
                                                    };
                                                });
                                            }}
                                        /> <span className="mx-2">Restrict public buckets</span>
                                        <br />
                                        <br />
                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                                disabled={!(createButtonContent.type === 'span' && createButtonContent.props.children === 'Create')}
                                            >
                                                {createButtonContent}
                                            </button>
                                        </div>
                                        <input type="checkbox" style={{ accentColor: "black" }} />&nbsp;&nbsp;&nbsp;keep tracking
                                        <br />
                                    </form>
                                    {terminalOutput && (
                                        <>
                                            <h4 className="mt-3"> output : </h4>
                                            <div className="bg-black text-terminal h6 rounded my-1 p-4"
                                                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                                {terminalOutput}
                                            </div>
                                        </>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
