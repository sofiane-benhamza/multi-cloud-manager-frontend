import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { regions, validateIPAddress } from "@/utils/aws";
import { getCredentials } from "@/utils/general";

export default function CreateVPC({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    const [terminalOutput, setTerminalOutput] = useState("");

    // VPC configuration
    const [vPC, setVPC] = useState({
        account: "",
        name: "",
        region: "",
        networkAddress: "",
        mask: "",
        tenancy: ""
    })

    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState({
        region: true,
        vPCInfo: true,
    })
    // Disable Create button 
    const vPCConfigIsComplete = () => {
        return Object.values(vPC).every(val => val !== null && val !== '');
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
    }, [token]);

    // Can not be optimized cause, calling functions time to time
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        switch (name) {
            case "account":
                setVPC(prevConfig => ({
                    ...prevConfig,
                    account: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    region: false
                }));
                break;
            case "region":
                setVPC(prevConfig => ({
                    ...prevConfig,
                    region: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    vPCInfo: false
                }));
                break;
            case "name":
                setVPC(prevConfig => ({
                    ...prevConfig,
                    name: value
                }))
                break;
            case "networkAddress":
                setVPC(prevConfig => ({
                    ...prevConfig,
                    networkAddress: value
                }))
                break;
            case "mask":
                setVPC(prevConfig => ({
                    ...prevConfig,
                    mask: value
                }))
                break;
            case "tenancy":
                setVPC(prevConfig => ({
                    ...prevConfig,
                    tenancy: value
                }))
                break;
        }
    };

    const handleCreateVPC = async (e) => {
        e.preventDefault();
        if (!vPCConfigIsComplete()) {
            return false
        }
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        try {
            const vPCConfiguration = new FormData();
            vPCConfiguration.append("token", token); //token authentication

            for (const [key, value] of Object.entries(vPC)) {
                if (key !== "networkAddress" && key !== "mask") {
                    vPCConfiguration.append(key, value);
                }
            }
            vPCConfiguration.append("cIDRBlock", vPC.networkAddress + "/" + vPC.mask)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/aws/vpc/`,
                {
                    method: "POST",
                    body: vPCConfiguration,
                }
            );
            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Virtual private cloud created succesfully",
                    type: "success",
                    isShown: true
                })
                setTerminalOutput(data.stdOut);
            } else {
                setWarning({
                    message: "Something went wrong, please try again later or contact support [error : 879]",
                    type: "warning",
                    isShown: true
                })
                setTerminalOutput(data.stdErr);

            }
        } catch (error) {
            console.error("something went wrong")
        } finally {
            setCreateButtonContent(<span>Create</span>)
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
                                    <h3 className="text-center h3 mb-2 mx-1 mx-md-4">
                                        create a VPC
                                    </h3>
                                    <form onSubmit={handleCreateVPC}>

                                        <label className="form-label">
                                            Account
                                        </label>
                                        <select
                                            type="text"
                                            id="account"
                                            name="account"
                                            value={vPC.account}

                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        > <option value="" defaultValue disabled>choose an existant account</option>
                                            {chooseFrom.accounts.map(name => (
                                                name.startsWith("aws") &&
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
                                            value={vPC.region}
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
                                            value={vPC.name} onChange={handleInputChange}
                                            placeholder="my-dev-vpc"
                                            disabled={disabled.vPCInfo}
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
                                                            if (!validateIPAddress(vPC.networkAddress)) {
                                                                setVPC((prevConfig) => ({ ...prevConfig, networkAddress: "" }));
                                                                setWarning({
                                                                    message: "Please enter a valid network address",
                                                                    type: "warning",
                                                                    isShown: true
                                                                })
                                                            }
                                                        }}
                                                        value={vPC.networkAddress} className="form-control"
                                                        placeholder="10.0.0.0"
                                                        disabled={disabled.vPCInfo}
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
                                                            if (!(vPC.mask > 15 && vPC.mask < 29)) {
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
                                                        value={vPC.mask}
                                                        placeholder="16"
                                                        disabled={disabled.vPCInfo}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <label className="form-label">Tenancy</label>
                                        <select
                                            type="text"
                                            id="tenancy"
                                            name="tenancy"
                                            value={vPC.tenancy}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            disabled={disabled.vPCInfo}
                                            required
                                        >
                                            <option value="" defaultValue disabled>choose a tenancy</option>
                                            <option value="default" >Default</option>
                                            <option value="dedicated" >Dedicated</option>
                                        </select>
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
