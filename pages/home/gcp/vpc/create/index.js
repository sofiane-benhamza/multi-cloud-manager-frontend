import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { regions } from "@/utils/gcp";
import { getCredentials, validateIPAddress } from "@/utils/general";

export default function CreateVPC({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState("");
    const INIT = {
        vpc: {
            account: "",
            region: "",
            name: "",
            networkAddress: "",
            mask: "",
            autoCreateSubnets: false
        }
    }
    // VPC configuration
    const [vpc, setVPC] = useState(INIT.vpc)

    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState({
        region: true,
        name: true,
        networkAddress: true,
        mask: true,
        autoCreateSubnets: true
    })

    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>);


    // Items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: []
    })

    //reference of input of keyname
    useEffect(() => { // Call get credentials
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) setToken("expired")
        });;
    }, [token, setToken]);

    const vpcArray = Object.keys(vpc);
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name == "account") {
            setVPC(INIT.vpc)
        } else if (name == "autoCreateSubnets") {
            setVPC((prev) => (
                {
                    ...prev,
                    autoCreateSubnets: !prev.autoCreateSubnets
                }
            ))
        }


        const index = vpcArray.indexOf(name);

        // Update the value
        setVPC((prev) => ({ ...prev, [name]: value }));

        //  Activate next field
        (index !== -1) && setDisabled((prev) => ({ ...prev, [vpcArray[index + 1]]: false }))
    }


    const handleCreateVPC = async (e) => {
        e.preventDefault();

        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        try {
            const vpcConfig = new FormData();
            vpcConfig.append("token", token); //token authentication

            for (const [key, value] of Object.entries(vpc)) {
                if (key !== "networkAddress" && key !== "mask") {
                    vpcConfig.append(key, value);
                }
            }

            vpcConfig.append("cidrBlock", vpc.networkAddress + "/" + vpc.mask)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/gcp/vpc/`,
                {
                    method: "POST",
                    body: vpcConfig,
                }
            );
            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Virtual private  has been created succesfully",
                    type: "success",
                    isShown: true
                })
                setTerminalOutput(data.stdOut);
            } else {
                setWarning({
                    message: "Something went wrong, please check the console for further informations.",
                    type: "warning",
                    isShown: true
                })
                setTerminalOutput(data.stdErr);

            }
        } catch (error) {
            setWarning({
                message: "Something went wrong, please try again later or contact support.",
                type: "warning",
                isShown: true
            })
            console.error("something went wrong")
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
                                    <form onSubmit={handleCreateVPC}>
                                        <div className="d-flex flex-row">
                                            <h3>Create a VPC</h3>
                                            <button
                                                className="btn btn-light btn-lg ml-auto" title="Reset">
                                                <i className="bi bi-trash3-fill cursor-pointer"
                                                    onClick={() => {
                                                        setToken(INIT.vpc);
                                                        setDisabled(INIT.disabled);
                                                        setCreateButtonContent(<span>Create</span>)
                                                    }}></i></button>


                                        </div>
                                        <label className="form-label">
                                            Account
                                        </label>
                                        <select
                                            type="text"
                                            id="account"
                                            name="account"
                                            value={vpc.account}

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
                                        <label className="form-label">
                                            Region
                                        </label>
                                        <select
                                            type="text"
                                            id="region"
                                            name="region"
                                            value={vpc.region}
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
                                            value={vpc.name} onChange={handleInputChange}
                                            placeholder="my-dev-vpc"
                                            disabled={disabled.name}
                                            className="form-select w-100 bg-light border-0"
                                            required
                                        />
                                        <br />
                                        <br />
                                        <div className="row">
                                            <div className="col-md-8">
                                                <div className="form-group">
                                                    <label className="form-label">Network Address</label>
                                                    <input
                                                        type="text"
                                                        name="networkAddress"
                                                        onChange={handleInputChange}
                                                        onBlur={(e) => {
                                                            if (!validateIPAddress(vpc.networkAddress)) {
                                                                setVPC((prevConfig) => ({ ...prevConfig, networkAddress: "" }));
                                                                setWarning({
                                                                    message: "Please enter a valid network address",
                                                                    type: "warning",
                                                                    isShown: true
                                                                })
                                                            }
                                                        }}
                                                        value={vpc.networkAddress} className="form-control"
                                                        placeholder="10.0.0.0"
                                                        disabled={disabled.networkAddress}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label className="form-label">Mask</label>
                                                    <input
                                                        type="number"
                                                        name="mask"
                                                        onChange={handleInputChange}
                                                        onBlur={() => {
                                                            if (!(vpc.mask > 15 && vpc.mask < 29)) {
                                                                setWarning({
                                                                    message: "Please enter a valide mask, digits from 16 to 28 only are accepted",
                                                                    type: "warning",
                                                                    isShown: true
                                                                })
                                                                setVPC(prevConfig => ({ ...prevConfig, mask: 16 }));
                                                            }
                                                        }}
                                                        className="form-control"
                                                        min="16"
                                                        max="28"
                                                        value={vpc.mask}
                                                        placeholder="16"
                                                        disabled={disabled.mask}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <br />
                                        <label>
                                        <input
                                            type="checkbox"
                                            id="autoCreateSubnets"
                                            style={{ accentColor: "black" }}
                                            name="autoCreateSubnets"
                                            value={vpc.autoCreateSubnets}
                                            className="form-select bg-light border-0"
                                            onChange={handleInputChange}
                                            disabled={disabled.autoCreateSubnets}


                                        />&nbsp;&nbsp;&nbsp;Auto create subnets
                                        </label>


                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                                disabled={!(createButtonContent.props.children === 'Create')}
                                            >
                                                {createButtonContent}
                                            </button>
                                        </div>
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
