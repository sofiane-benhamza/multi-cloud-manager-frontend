import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getCredentials } from "@/utils/general";
import { getResourceGroups, locations } from "@/utils/azure";

export default function CreateVN({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    const [terraformOutput, setTerraformOutput] = useState("");

    const INIT = {
        VN: {
            account: "",
            location: "",
            resourceGroup: "",
            name: "",
            networkAddress: "",
            mask: "",
            dns: ""
        },
        DISABLED: {
            location: true,
            resourceGroup: true,
            name: true,
            networkAddress: true,
            mask: true,
            dns: true
        }
    }
    // VPC configuration
    const [vn, setVN] = useState(INIT.VN)

    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState(INIT.DISABLED)


    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>);


    // Items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
        resourceGroups: []
    })

    //reference of input of keyname
    useEffect(() => { // Call get credentials
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) setToken("expired")
        });;
    }, [token, setToken]);

    const vnArray = Object.keys(vn)
    const handleInputChange = (e) => {
        const { name, value } = e.target;


        name == "account" && setVN(INIT.VN) && setDisabled(INIT.DISABLED);
        // Update the value
        setVN((prev) => ({ ...prev, [name]: value }));

        //  Activate next field
        const index = vnArray.indexOf(name);
        (index !== -1) && setDisabled((prev) => ({ ...prev, [vnArray[index + 1]]: false }))

        switch (name) {
            case "account":
                // If account is changed,  erase all previous config
                setChooseFrom(prev => ({
                    accounts: prev.accounts,
                    ...Object.keys(prev).reduce((acc, key) => key === "accounts" ? acc : { ...acc, [key]: [] }, {})
                }));
                break;
            case "location":
                getResourceGroups(token, vn.account, value, setChooseFrom) // Value = vm.location
                break;
            default:
                break;
        }
    };

    const handleCreateVN = async (e) => {
        e.preventDefault();
        setTerraformOutput("")
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        try {
            const vnConfig = new FormData();
            vnConfig.append("token", token); //token authentication

            for (const [key, value] of Object.entries(vn)) {
                if (key !== "networkAddress" && key !== "mask") {
                    vnConfig.append(key, value);
                }
            }
            vnConfig.append("network", vn.networkAddress + "/" + vn.mask)

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/azure/vn/`,
                {
                    method: "POST",
                    body: vnConfig,
                }
            );
            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your virtual network has been created succesfully",
                    type: "success",
                    isShown: true
                })
                setTerraformOutput(data.stdOut);
            } else {
                setWarning({
                    message: "something went wrong, please try again later or contact support [error : 348]",
                    type: "danger",
                    isShown: true
                });
                setTerraformOutput(data.stdErr);

            }
        } catch (error) {
            console.warn(error)
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
                                        create a Virtual Network
                                    </h3>
                                    <form onSubmit={handleCreateVN}>

                                        <label className="form-label">
                                            Account
                                        </label>
                                        <select
                                            type="text"
                                            id="account"
                                            name="account"
                                            value={vn.account}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        > <option value="" defaultValue disabled>choose an existant account</option>
                                            {chooseFrom.accounts.map(name => (
                                                name.startsWith("azure") &&
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            Location
                                        </label>
                                        <select
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={vn.location}
                                            disabled={disabled.location}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose an installation Location</option>
                                            {locations.map((location, index) => (
                                                <option key={index} value={location}>{location}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            Resource group
                                        </label>

                                        <select
                                            type="text"
                                            id="resourceGroup"
                                            name="resourceGroup"
                                            value={vn.resourceGroup}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            disabled={disabled.resourceGroup}
                                            required
                                        >
                                            <option value="" defaultValue disabled>choose a resource group</option>
                                            {chooseFrom.resourceGroups.map(resourceGroup => (
                                                <option key={resourceGroup} value={resourceGroup} disabled={resourceGroup.startsWith("there is")}>{resourceGroup}</option>
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
                                            value={vn.name} onChange={handleInputChange}
                                            placeholder="my-dev-vn"
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
                                                        id="networkAddress"
                                                        onChange={handleInputChange}
                                                        value={vn.networkAddress}
                                                        className="form-control"
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
                                                        className="form-control"
                                                        min="16"
                                                        max="28"
                                                        title="IPv4 addresses, must be separated by comma"
                                                        value={vn.mask}
                                                        placeholder="16"
                                                        disabled={disabled.mask}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <label className="form-label">DNS servers</label>
                                        <input
                                            type="text"
                                            id="dns"
                                            name="dns"
                                            value={vn.dns}
                                            className="form-select w-100 bg-light border-0"
                                            placeholder="8.8.8.8, 2.2.2.2"
                                            onChange={handleInputChange}
                                            pattern="^((25[0-5]|(2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|(2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9]))(,\s*)?)+$"
                                            title="at least one dns server ip address must be provided,  separate dns servers by a comma"
                                            disabled={disabled.dns}
                                            required
                                        />
                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                                disabled={!(createButtonContent.props.children === 'Create')}
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
                                    {terraformOutput && (
                                        <>
                                            <h4 className="mt-3"> output : </h4>
                                            <div className="bg-black text-terminal h6 rounded my-1 p-4"
                                                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                                {terraformOutput}
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
