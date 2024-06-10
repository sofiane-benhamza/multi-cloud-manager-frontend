import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/pages/_app";
import { getVPCs, regions } from "@/utils/gcp";
import { getCredentials, Separation, validateIPAddress } from "@/utils/general";

export default function CreateSubnet({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState({ terraform: false });


    const INIT = {
        SUBNET: {
            account: "",
            region: "",
            vpc: "",
            subnetName: "",
            networkAddress: "",
            mask: "",

        },
        DISABLED: {
            region: true,
            vpc: true,
            subnetName: true,
        }
    };

    // SUBNET configuration
    const [subnet, setSubnet] = useState(INIT.SUBNET)
    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState(INIT.DISABLED)
    // Disable Create button 

    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>
    );


    // Items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
        vpcs: [],
    })


    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) {
                setToken("expired")
            }
        });

    }, [token, setToken]); // Token variation for re-execution


    //  Can not be optimized cause, calling functions time to time
    const subnetArray = Object.keys(subnet) // Value = ce.location
    Object.keys(subnet);
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        name == "account" && setSubnet(INIT.SUBNET)

        const index = subnetArray.indexOf(name);

        // Update the value
        setSubnet((prev) => ({ ...prev, [name]: value }));

        //  Activate next field
        (index !== -1) && setDisabled((prev) => ({ ...prev, [subnetArray[index + 1]]: false }))

        switch (name) {
            case "account":
                // If account is changed,  erase all previous config
                setChooseFrom(prev => ({
                    accounts: prev.accounts,
                    ...Object.keys(prev).reduce((acc, key) => key === "accounts" ? acc : { ...acc, [key]: [] }, {})
                }));
                break;
            case "region":
                getVPCs(token, subnet.account, value, setChooseFrom) // Value = ce.location
                break;
            default:
                break;

        }



    };

    const handleCreateSubnet = async (e) => {
        e.preventDefault();
        setTerminalOutput({ terraform: false });

        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        const notToSend = ["networkAddress","mask"]
        try {
            const form = new FormData();
            form.append("token", token); // Token authentication

            for (const key in subnet) {
                if (subnet.hasOwnProperty(key) && !notToSend.includes(key)) {
                    form.append(key, subnet[key]);
                }
            }

            form.append("cidrBlock", subnet.networkAddress+"/"+subnet.mask)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/gcp/subnet/`,
                {
                    method: "POST",
                    body: form,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your Subnet has been created successfully",
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
                setTerminalOutput({ terraform: data.stdErr });
            }
        } catch (err) {
            setWarning({
                message: "something went wrong, please try again later or contact support.",
                type: "danger",
                isShown: true
            });
        } finally {
            setCreateButtonContent(<span>Create</span>)
        }
    };

    return (
        <div className=" d-flex align-items-center justify-content-center p-5 tilt-warp-title">
            <div className="row d-flex justify-content-center align-items-center col-xl-4 col-lg-4 col-md-8 col-sm-10 col-xs-12">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
                    <div
                        className="bg-transparent text-dark rounded"
                    >
                        <div className="card-body p-md-5 ">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <form onSubmit={handleCreateSubnet}>
                                        <h3 className="text-center h3 mb-2 mx-1 mx-md-4 row">
                                            <p>create a subnet</p>
                                            <button
                                                className="btn btn-light btn-lg ml-auto" title="Reset">
                                                <i className="bi bi-trash3-fill cursor-pointer"
                                                    onClick={() => {
                                                        setSubnet(INIT.SUBNET);
                                                        setDisabled(INIT.DISABLED);
                                                        setChooseFrom((prev) => ({
                                                            accounts: prev.accounts,
                                                            resourceGroups: [],
                                                            vns: [],
                                                        }))
                                                        setCreateButtonContent(<span>Create</span>)
                                                    }}></i>
                                            </button>
                                        </h3>

                                        <label className="form-label">
                                            Account
                                        </label>
                                        <select
                                            type="text"
                                            id="account"
                                            name="account"
                                            value={subnet.account}
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
                                            id="region"
                                            name="region"
                                            value={subnet.region}
                                            disabled={disabled.region}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a region</option>
                                            {regions.map((region, index) => (
                                                <option key={index} value={region}>{region}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />


                                        <label className="form-label">
                                            virtual private cloud
                                        </label>
                                        <select
                                            id="vpc"
                                            name="vpc"
                                            className="form-select w-100 bg-light border-0"
                                            value={subnet.vpc}
                                            onChange={handleInputChange}
                                            disabled={disabled.vpc}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a VPC</option>
                                            {chooseFrom.vpcs.length > 0 ? chooseFrom.vpcs.map((vpc, index) => (
                                                <option key={index} value={vpc.name} > {vpc.name}
                                                </option>


                                            )) : <option disabled>there is no VPCs in the current zone</option>}
                                        </select>
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            Subnet Name
                                        </label>
                                        <input
                                            type="text"
                                            id="subnetName"
                                            disabled={disabled.subnetName}
                                            value={subnet.subnetName}
                                            name="subnetName"
                                            placeholder="my-dev-subnet"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />
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
                                                            if (!validateIPAddress(subnet.networkAddress)) {
                                                                setSubnet((prevConfig) => ({ ...prevConfig, networkAddress: "" }));
                                                            }
                                                        }}
                                                        value={subnet.networkAddress} className="form-control"
                                                        placeholder="10.0.0.0"
                                                        disabled={disabled.subnetInfo}
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
                                                            if (!(subnet.mask > 15 && subnet.mask < 29)) {
                                                                setSubnet(prevConfig => ({ ...prevConfig, mask: 16 }));
                                                            }
                                                        }}
                                                        className="form-control"
                                                        min="16"
                                                        max="28"
                                                        value={subnet.mask}
                                                        placeholder="16"
                                                        disabled={disabled.subnetInfo}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

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
                                    {terminalOutput.terraform && (
                                        <>
                                            {terminalOutput.ssh}
                                            <h4 className="mt-3"> output : </h4>
                                            <div className="bg-black text-terminal h6 rounded my-1 p-4"
                                                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                                {terminalOutput.terraform}
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



