import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { FullContext } from "../../../../_app";
import { getCredentials, regions, separation, validateIPAddress } from "../../../../../utils/functions";

export default function CreateVPC({ setConnected, setToken }) {
    const { isConnected, token } = useContext(FullContext);
    const router = useRouter();
    const { code } = router.query;

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
        const getAccounts = async () => {
            await getCredentials(token, setChooseFrom);
        };
        getAccounts();
    }, []);

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

    const handleCreateVPC = async () => {
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
                "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/terraform/aws/vpc/",
                {
                    method: "POST",
                    body: vPCConfiguration,
                }
            );
            if (response.ok) {
                const data = await response.json();
                setCreateButtonContent(<span>Successfully&nbsp;created</span>)

                router.push("./")
            } else {
                const errorData = await response.json();
                alert("something went wrong ... 221 ");

            }
        } catch (error) {
            alert("something went wrong ... 259 ");
        } finally {
            setCreateButtonContent(<span>Create</span>)
        }

    };

    return (
        <div className=" d-flex align-items-center justify-content-center p-5">
            <div className="row d-flex justify-content-center align-items-center col-xl-4 col-lg-4 col-md-5 col-sm-10 col-xs-12">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
                    <div
                        className="bg-transparent text-dark rounded"
                    >
                        <div className="card-body p-md-5 ">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <h3 className="text-center h3 mb-2 mx-1 mx-md-4">
                                        create a Virtual Private Cloud
                                    </h3>
                                    <form>

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
                                            value={vPC.region}
                                            disabled={disabled.region}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
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
                                                                alert("Please enter a valid network address");
                                                            }
                                                        }}
                                                        value={vPC.networkAddress} className="form-control"
                                                        placeholder="10.0.0.0"
                                                        disabled={disabled.vPCInfo}
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
                                                                alert("enter a valide mask, 16-28");
                                                                setVPC(prevConfig => ({ ...prevConfig, mask: 16 }));
                                                            }
                                                        }}
                                                        className="form-control"
                                                        min="16"
                                                        max="28"
                                                        value={vPC.mask}
                                                        placeholder="16"
                                                        disabled={disabled.vPCInfo}
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
                                        >
                                            <option value="" defaultValue disabled>choose a tenancy</option>
                                            <option value="default" >Default</option>
                                            <option value="dedicated" >Dedicated</option>
                                        </select>
                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="button"
                                                className="btn btn-dark btn-lg"
                                                onClick={handleCreateVPC}
                                                disabled={!vPCConfigIsComplete()}
                                            >
                                                {createButtonContent}
                                            </button>
                                        </div>
                                        <input type="checkbox" style={{ accentColor: "black" }} />&nbsp;&nbsp;&nbsp;keep tracking
                                        <br />
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
