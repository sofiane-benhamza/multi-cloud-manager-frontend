import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/pages/_app";
import { getWebApps, locations } from "@/utils/azure";
import { getCredentials, Separation } from "@/utils/general";

export default function CreateVM({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState({ terraform: false });


    const INIT = {
        GITHUB: {
            account: "",
            location: "",
            webApp: "",
            url: "",
            branch: "",
            outputLocation: "",
            gitAccount: "",
            resourceGroup: ""
        },
        DISABLED: {
            location: true,
            webApp: true,
            url: true,
            branch: true,
            outputLocation: true,
            gitAccount: true,
        }
    };

    // VM configuration
    const [github, setGithub] = useState(INIT.GITHUB)
    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState(INIT.DISABLED)
    // Disable Create button 

    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>
    );


    // Items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
        webApps: []
    })


    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) {
                setToken("expired")
            }
        });

    }, [token, setToken]); // Token variation for re-execution


    //  Can not be optimized cause, calling functions time to time
    const githubArray = Object.keys(github);
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        name == "account" && setGithub(INIT.GITHUB)
        name == "location" &&
            getWebApps(token, github.account, value, setChooseFrom).then((isOk) => {
                if (!isOk) {
                    setWarning({
                        message: "there is a problem with the credentials provided !",
                        type: "danger",
                        isShown: true
                    })
                }
            });

        const index = githubArray.indexOf(name);

        // Update the value
        setGithub((prev) => ({ ...prev, [name]: value }));

        //  Activate next field
        (index !== -1) && setDisabled((prev) => ({ ...prev, [githubArray[index + 1]]: false }))

    };

    const handleCreateWebApp = async (e) => {
        e.preventDefault();
        setTerminalOutput({ terraform: false });
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);
        const fullWebApp = chooseFrom.webApps.find(webApp => webApp.name === github.webApp)
        try {
            const githubConfig = new FormData();
            githubConfig.append("token", token); // Token authentication
            githubConfig.append("service", "azure_static_web_app"); // Token authentication
            githubConfig.append("resourceGroupName", fullWebApp.resourceGroup)

            for (const key in github) {
                githubConfig.append(key, github[key]);
            }


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/github_actions/`,
                {
                    method: "POST",
                    body: githubConfig,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your Web Application has been deployed successfully",
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
                message: "something went wrong, please try again later or contact support [error : 532]",
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
                                                        setGithub(INIT.GITHUB);
                                                        setDisabled(INIT.DISABLED);
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
                                            value={github.account}
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
                                            value={github.location}
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


                                        <Separation desc="configuration" className="w-100" />
                                        <label className="form-label">
                                            Static web application
                                        </label>
                                        <select
                                            type="text"
                                            id="webApp"
                                            name="webApp"
                                            value={github.webApp}
                                            disabled={disabled.webApp}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a static web application</option>
                                            {chooseFrom.webApps.map((webApp, index) => (
                                                <option key={index} value={webApp.name} disabled={webApp.name == "-"}>{webApp.name != "-" ? webApp.name : "There  is no static web applications."}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            Repository URL
                                        </label>
                                        <input
                                            type="text"
                                            id="url"
                                            name="url"
                                            value={github.url}
                                            disabled={disabled.url}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            branch
                                        </label>

                                        <input
                                            type="text"
                                            id="branch"
                                            name="branch"
                                            value={github.branch}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            disabled={disabled.branch}
                                            required
                                        />
                                        <br />
                                        <br />

                                        <label className="form-label">
                                            Output build location <i title="where the build files are generated (ex: React: build/ ) " className="mx-2 bi bi-question-circle-fill cursor-pointer"></i>
                                        </label>

                                        <input
                                            type="text"
                                            id="outputLocation"
                                            name="outputLocation"
                                            value={github.outputLocation}
                                            placeholder="dist/, next/, build/ ... "
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            disabled={disabled.outputLocation}
                                            required
                                        />
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            github
                                        </label>
                                        <select
                                            type="text"
                                            id="gitAccount"
                                            name="gitAccount"
                                            value={github.gitAccount}
                                            className="form-select w-100 bg-light border-0"
                                            disabled={disabled.gitAccount}
                                            onChange={handleInputChange}
                                            required
                                        > <option value="" defaultValue disabled>choose an existant account</option>
                                            {chooseFrom.accounts.map(name => (
                                                name.startsWith("git") &&
                                                <option key={name} value={name}>{name}</option>
                                            ))}
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



