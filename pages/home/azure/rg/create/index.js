import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/pages/_app";
import { sizes, locations, getVNs, getSubnets, getSecurityGroups, getResourceGroups, getSSHKeys } from "@/utils/azure";
import { getCredentials, Separation, validateMPassword } from "@/utils/general";
import Downloader from "@/comps/Downloader";

export default function CreateRG({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState({ terraform: false });


    const INIT = {
        softwares: ["apache2", "nginx", "java 17", "mongodb", "tomcat", "docker"],
        RG: {
            account: "",
            location: "",
            resourceGroup: "",

        },
        DISABLED: {
            location: true,
            resourceGroup: true,
        }
    };

    // VM configuration
    const [rg, setRG] = useState(INIT.RG)
    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState(INIT.DISABLED)
    // Disable Create button 

    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>
    );


    // Items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
        resourceGroups: [],
    })


    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) {
                setToken("expired")
            }
        });

    }, [token, setToken]); // Token variation for re-execution


    //  Can not be optimized cause, calling functions time to time
    const rgArray = Object.keys(rg);
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        name == "account" && setRG(INIT.RG)

        const index = rgArray.indexOf(name);

        // Update the value
        setRG((prev) => ({ ...prev, [name]: value }));

        //  Activate next field
        (index !== -1) && setDisabled((prev) => ({ ...prev, [rgArray[index + 1]]: false }))

        switch (name) {
            case "account":
                // If account is changed,  erase all previous config
                setChooseFrom(prev => ({
                    accounts: prev.accounts,
                }));
                break;
            case "location":
                getResourceGroups(token, rg.account, value, setChooseFrom) // Value = vm.location
                break;
            default:
                break;

        }



    };

    const handleCreateRG = async (e) => {
        e.preventDefault();
        setTerminalOutput({ terraform: false });
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        const rgNameisUnique = !chooseFrom.resourceGroups.includes(rg.resourceGroup);  // Same key name at aws will failed, checked here
        if (!rgNameisUnique) {
            setWarning({
                message: "Resource group already exists, please choose another name or change the location ",
                type: "danger",
                isShown: true
            });
            setCreateButtonContent(<span>Create</span>)
            return;
        }

        try {
            const rgConfig = new FormData();
            rgConfig.append("token", token); // Token authentication


            for (const key in rg) {
                rgConfig.append(key, rg[key]);
            }


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/azure/resource_group/`,
                {
                    method: "POST",
                    body: rgConfig,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your resource group has been created successfully",
                    type: "success",
                    isShown: true
                });

                setTerminalOutput({
                    terraform: data.stdOut
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
            console.error(err);
            console.error("something went wrong");
            setWarning({
                message: "something went wrong, please try again later or contact support [error : 437]",
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
                                    <form onSubmit={handleCreateRG}>
                                        <h3 className="text-center h3 mb-2 mx-1 mx-md-4 row">
                                            <p>create an VM</p>
                                            <button
                                                className="btn btn-light btn-lg ml-auto" title="Reset">
                                                <i className="bi bi-trash3-fill cursor-pointer"
                                                    onClick={() => {
                                                        setRG(INIT.RG)
                                                        setDisabled(INIT.DISABLED);
                                                        setChooseFrom((prev) => ({
                                                            accounts: prev.accounts,
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
                                            value={rg.account}
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


                                        <Separation desc="Placement" />

                                        <label className="form-label">
                                            Location
                                        </label>
                                        <select
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={rg.location}
                                            disabled={disabled.location}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a location</option>
                                            {locations.map((region, index) => (
                                                <option key={index} value={region}>{region}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            Resource group
                                        </label>

                                        <input
                                            type="text"
                                            id="resourceGroup"
                                            name="resourceGroup"
                                            value={rg.resourceGroup}
                                            pattern="^[a-zA-Z0-9_\-\.\(\)]{1,90}$"
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            disabled={disabled.resourceGroup}
                                            required
                                        />

                                        <br />
                                        <br />


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



