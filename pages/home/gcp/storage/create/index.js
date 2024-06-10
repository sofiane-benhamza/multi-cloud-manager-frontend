import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "@/pages/_app";
import { regions } from "@/utils/gcp"
import { getCredentials, Separation } from "@/utils/general";

export default function CreateStorage({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const [terminalOutput, setTerminalOutput] = useState({ terraform: false });

    const INIT = {
        bucket: {
            account: "",
            location: "",
            region: "",
            bucketName: "",
            publicAccessPrevention: "",
            cors: "",
            methods: {
                post: true,
                get: false,
                put: false,
                delete: false,
                patch: false,
                head: false,
            },
        },
        disabled: {
            account: false,
            location: true,
            region: true,
            bucketName: true,
            publicAccessPrevention: true,
            methods: true,
            cors: true,
        }
    };

    // CE configuration
    const [bucket, setBucket] = useState(INIT.bucket)
    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState(INIT.disabled)
    // Disable Create button 

    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>
    );


    // Items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
    })


    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) {
                setToken("expired")
            }
        });

    }, [token, setToken]); // token variation for re-execution


    // Can not be optimized cause, calling functions time to time
    const bucketArray = Object.keys(INIT.disabled);
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "account") {
            setBucket(INIT.bucket)
        } else if (name == "methods") {
            setDisabled((prev) => ({
                ...prev,
                cors: false
            }))
            setBucket((prev) => ({
                ...prev,
                methods: {
                    ...prev.methods,
                    [value]: !prev.methods[value]
                }
            }))
            return
        }

        const index = bucketArray.indexOf(name);

        // Update the value
        setBucket((prev) => ({ ...prev, [name]: value }));

        //  Activate next field
        (index !== -1) && setDisabled((prev) => ({ ...prev, [bucketArray[index + 1]]: false }))


    };

    const handleCreateBucket = async (e) => {
        e.preventDefault();
        setTerminalOutput({ terraform: false });
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        try {
            const bucketConfig = new FormData();
            bucketConfig.append("token", token); // Token authentication


            for (const key in bucket) {
                key != "methods" && bucketConfig.append(key, bucket[key]);
            }
            let methods = "";

            for (const key in bucket.methods) {
                if (bucket.methods[key]) {
                    methods += `${key.toUpperCase()}, `
                }
            }

            bucketConfig.append("methods", methods)




            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/gcp/storage/`,
                {
                    method: "POST",
                    body: bucketConfig,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your Bucket has been created successfully",
                    type: "success",
                    isShown: true
                });

                setTerminalOutput({
                    terraform: data.stdOut,
                });
            } else {
                setWarning({
                    message: "something went wrong, see the console for more informations",
                    type: "danger",
                    isShown: true
                });
                setTerminalOutput({
                    terraform: data.stdErr
                });
            }
        } catch (err) {
            console.error("something went wrong");
            setWarning({
                message: "something went wrong, please try again later or contact support [error : 728]",
                type: "danger",
                isShown: true
            });
        } finally {
            setCreateButtonContent(<span>Create</span>)
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center p-5 tilt-warp-title">
            <div className="row d-flex justify-content-center align-items-center col-xl-5 col-lg-6 col-md-8 col-sm-10 col-xs-12">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
                    <div className="bg-transparent text-dark rounded">
                        <div className="card-body p-md-5">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="w-100">
                                    <form onSubmit={handleCreateBucket}>
                                        <h3 className="text-center d-flex flex-row">
                                            <p>Create a Bucket</p>
                                            <button
                                                className="btn btn-light btn-lg ml-auto" title="Reset">
                                                <i className="bi bi-trash3-fill cursor-pointer"
                                                    onClick={() => {
                                                        setBucket(INIT.bucket);
                                                        setDisabled(INIT.disabled);
                                                        setCreateButtonContent(<span>Create</span>)
                                                    }}></i></button>
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
                                                name.startsWith("gcp") &&
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <Separation desc="Placement" />

                                        <label className="form-label">
                                            Location
                                        </label>
                                        <select
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={bucket.location}
                                            disabled={disabled.location}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" disabled defaultValue>Choose a location </option>
                                            {["EU", "US", "ME", "AU"].map((location, index) => (
                                                <option key={index} value={location}>{location}</option>
                                            ))}

                                        </select>
                                        <br />
                                        <br />

                                        <label className="form-label">Region</label>
                                        <select
                                            id="region"
                                            name="region"
                                            value={bucket.region}
                                            disabled={disabled.region}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>
                                                Choose an installation region
                                            </option>
                                            {regions.map((region, index) => (
                                                <option key={index} value={region}>
                                                    {region}
                                                </option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <label>Bucket name</label>
                                        <input
                                            type="text"
                                            id="bucketName"
                                            name="bucketName"
                                            value={bucket.bucketName}
                                            disabled={disabled.bucketName}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        />

                                        <Separation desc="Access" />

                                        <label className="form-label">
                                            Public access prevention
                                        </label>
                                        <select
                                            type="text"
                                            id="publicAccessPrevention"
                                            name="publicAccessPrevention"
                                            value={bucket.publicAccessPrevention}
                                            disabled={disabled.publicAccessPrevention}
                                            className="form-select w-100 bg-light border-0 mb-3"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" disabled defaultValue>Choose a policy </option>
                                            {["enforced", "inherited"].map((location, index) => (
                                                <option key={index} value={location}>{location}</option>
                                            ))}

                                        </select>


                                        <table className="w-100">
                                            <thead>
                                                <tr>
                                                    Methods :
                                                </tr>
                                                <tr></tr>
                                                <tr></tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <label className="form-label my-1">
                                                            <input
                                                                type="checkbox"
                                                                style={{ accentColor: "black" }}
                                                                value={"post"}
                                                                name="methods"
                                                                checked={bucket.methods.post}
                                                                disabled={disabled.methods}
                                                                onChange={handleInputChange}
                                                            />
                                                            <span className="ml-1">POST</span>
                                                        </label>
                                                    </td>
                                                    <td>
                                                        <label className="form-label my-1">
                                                            <input
                                                                type="checkbox"
                                                                style={{ accentColor: "black" }}
                                                                value={"get"}
                                                                name="methods"
                                                                checked={bucket.methods.get}
                                                                disabled={disabled.methods}
                                                                onChange={handleInputChange}
                                                            />
                                                            <span className="ml-1">GET</span>
                                                        </label>
                                                    </td>
                                                    <td>
                                                        <label className="form-label my-1">
                                                            <input
                                                                type="checkbox"
                                                                style={{ accentColor: "black" }}
                                                                value={"put"}
                                                                name="methods"
                                                                checked={bucket.methods.put}
                                                                disabled={disabled.methods}
                                                                onChange={handleInputChange}
                                                            />
                                                            <span className="ml-1">PUT</span>
                                                        </label>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <label className="form-label my-1">
                                                            <input
                                                                type="checkbox"
                                                                style={{ accentColor: "black" }}
                                                                value={"delete"}
                                                                name="methods"
                                                                checked={bucket.methods.delete}
                                                                disabled={disabled.methods}
                                                                onChange={handleInputChange}
                                                            />
                                                            <span className="ml-1">DELETE</span>
                                                        </label>
                                                    </td>
                                                    <td>
                                                        <label className="form-label my-1">
                                                            <input
                                                                type="checkbox"
                                                                style={{ accentColor: "black" }}
                                                                value={"head"}
                                                                name="methods"
                                                                checked={bucket.methods.head}
                                                                disabled={disabled.methods}
                                                                onChange={handleInputChange}
                                                            />
                                                            <span className="ml-1">HEAD</span>
                                                        </label>
                                                    </td>
                                                    <td>
                                                        <label className="form-label my-1">
                                                            <input
                                                                type="checkbox"
                                                                style={{ accentColor: "black" }}
                                                                value={"patch"}
                                                                name="methods"
                                                                checked={bucket.methods.patch}
                                                                disabled={disabled.methods}
                                                                onChange={handleInputChange}
                                                            />
                                                            <span className="ml-1">PATCH</span>
                                                        </label>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="my-3">
                                            <label>Allowed Sources (separate by comma)
                                                <input
                                                    type="text"
                                                    id="cors"
                                                    name="cors"
                                                    value={bucket.cors}
                                                    disabled={disabled.cors}
                                                    placeholder="https://web-app.com, https://api-backend.com"
                                                    className="form-select w-100 px-3 my-2 bg-light border-0"
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                </input>
                                            </label>
                                        </div>




                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                                disabled={!(createButtonContent.props.children === 'Create') || disabled.toInstall}
                                            >
                                                {createButtonContent}
                                            </button>
                                        </div>
                                        {/* Factory Animation */}
                                        {!(createButtonContent.props.children === 'Create') &&
                                            <div className="mt-5 d-flex justify-content-center">
                                                <div className='text-dark mx-4'>We are working on it ...</div>
                                                <div className='factory-loader'></div>
                                            </div>}
                                        <br />
                                    </form>
                                    {
                                        terminalOutput.terraform && (
                                            <>
                                                <h4 className="mt-3"> output : </h4>
                                                <div className="bg-black text-terminal h6 rounded my-1 p-4"
                                                    style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                                    {terminalOutput.terraform}
                                                </div>
                                            </>)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}



