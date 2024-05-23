import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/pages/_app";
import { locations, getResourceGroups } from "@/utils/azure";
import { getCredentials, Separation } from "@/utils/general";

export default function CreateVM({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState({ terraform: false });


    const INIT = {
        softwares: ["apache2", "nginx", "java 17", "mongodb", "tomcat", "docker"],
        WEBAPP: {
            account: "",
            location: "",
            resourceGroup: "",
            name: "",
            skuSize: "",
            skuTier: "",
        },
        DISABLED: {
            location: true,
            resourceGroup: true,
            name: true,
            skuSize: true,
            skuTier: true,
        }
    };

    // VM configuration
    const [webApp, setWebApp] = useState(INIT.WEBAPP)
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

    }, []); // Token variation for re-execution


    //  Can not be optimized cause, calling functions time to time
    const webAppArray = Object.keys(webApp);
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        name == "account" && setWebApp(INIT.WEBAPP)

        const index = webAppArray.indexOf(name);

        // Update the value
        setWebApp((prev) => ({ ...prev, [name]: value }));

        //  Activate next field
        (index !== -1) && setDisabled((prev) => ({ ...prev, [webAppArray[index + 1]]: false }))

        switch (name) {
            case "account":
                setChooseFrom(prev => ({
                    accounts: prev.accounts,
                    resourceGroups: []
                }));
                break;
            case "location":
                getResourceGroups(token, webApp.account, value, setChooseFrom) // Value = webApp.location
                break;
            default:
                break;

        }



    };

    const handleCreateWebApp = async (e) => {
        e.preventDefault();
        setTerminalOutput({ terraform: false });
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        try {
            const webAppConfig = new FormData();
            webAppConfig.append("token", token); // Token authentication

            for (const key in webApp) {
                webAppConfig.append(key, webApp[key]);
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/azure/web_app/`,
                {
                    method: "POST",
                    body: webAppConfig,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your Web Application has been created successfully",
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
            console.error("something went wrong");
            setWarning({
                message: "something went wrong, please try again later or contact support [error : 238]",
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
                                    <form onSubmit={handleCreateWebApp}>
                                        <h3 className="text-center h3 mb-2 mx-1 row d-flex flex-row">
                                            <p>create a Static Web App</p>
                                            <p
                                                className="btn btn-light btn-lg ml-auto" title="Reset">
                                                <i className="bi bi-trash3-fill cursor-pointer"
                                                    onClick={() => {
                                                        setWebApp(INIT.WEBAPP);
                                                        setDisabled(INIT.DISABLED);
                                                        setChooseFrom((prev) => ({
                                                            accounts: prev.accounts,
                                                            resourceGroups: [],
                                                        }))
                                                        setCreateButtonContent(<span>Create</span>)
                                                    }}></i>
                                            </p>
                                        </h3>

                                        <label className="form-label">
                                            Account
                                        </label>
                                        <select
                                            type="text"
                                            id="account"
                                            name="account"
                                            value={webApp.account}
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
                                            value={webApp.location}
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

                                        <select
                                            type="text"
                                            id="resourceGroup"
                                            name="resourceGroup"
                                            value={webApp.resourceGroup}
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
                                            Web application's name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            placeholder="school-app"
                                            pattern="^[a-zA-Z0-9\-]{2,60}$"
                                            title="letters, digits, and hyphens are allowed from 2 to 60 character"
                                            className="form-select w-100 bg-light border-0"
                                            value={webApp.name}
                                            onChange={handleInputChange}
                                            disabled={disabled.name}
                                            required
                                        />
                                        <br />
                                        <br />

                                        <label className="form-label">
                                            SKU Size
                                        </label>
                                        <select
                                            id="skuSize"
                                            name="skuSize"
                                            className="form-select w-100 bg-light border-0"
                                            value={webApp.skuSize}
                                            onChange={handleInputChange}
                                            disabled={disabled.skuSize}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose an SKU Size option</option>
                                            <option value="0"  >Free</option>
                                            <option value="1"  >Standard</option>

                                        </select>
                                        <br />
                                        <br />

                                        <label className="form-label">
                                            SKU Tier
                                        </label>
                                        <select
                                            id="skuTier"
                                            name="skuTier"
                                            className="form-select w-100 bg-light border-0"
                                            value={webApp.skuTier}
                                            onChange={handleInputChange}
                                            disabled={disabled.skuTier}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose an SKU Tier option</option>
                                            <option value="0"  >Free</option>
                                            <option value="1"  >Standard</option>

                                        </select>
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



