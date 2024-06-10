import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "@/pages/_app";
import { regions } from "@/utils/aws";
import { getCredentials, Separation, valideGithubRepository } from "@/utils/general";

export default function CreateAmplifyApp({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState("");


    const INIT = {
        amplifyApp: {
            account: "",
            region: "",
            appName: "",
            appTechnology: "",
            githubLink: "",
            gitAccount: "",
            environmentVariables: {}
        },
        disabled: {
            region: true,
            appName: true,
            appTechnology: true,
            githubLink: true,
            gitAccount: true,
            environmentVariables: true
        }
    };

    // amplifyApp configuration
    const [amplifyApp, setAmplifyApp] = useState(INIT.amplifyApp)
    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState(INIT.disabled)
    // Disable Create button 

    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>
    );


    // Items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
        technologies: ["Next js", "React js", "Angular", "Static"]
    })


    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) {
                setToken("expired")
            }
        });

    }, [token, setToken]); // token variation for re-execution


    // Remove disabled sequentiely
    const amplifyAppArray = Object.keys(amplifyApp);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const index = amplifyAppArray.indexOf(name);
        (index !== -1) && setDisabled((prev) => ({ ...prev, [amplifyAppArray[index + 1]]: false }))
        // Init everything if its account
        name === "account" && setAmplifyApp(INIT.amplifyApp);
        // Update the value finally
        setAmplifyApp((prevConfig) => ({ ...prevConfig, [name]: value }));
    };

    //  ENV VARS -> Went crazy with the dynamic cards

    const envVarsCard = (id) => {
        return (<div key={id} className="d-flex column w-100  my-1">
            <input id={`key-${id}`} type="text" className="w-25 mr-2" onChange={() => { handleFieldChange(id) }} onKeyPress={(e) => { if (e.key === " ") e.preventDefault(); }} />
            <input id={`value-${id}`} type="text" onChange={() => { handleFieldChange(id) }} onKeyPress={(e) => { if (e.key === " ") e.preventDefault(); }} />
            {id != 0 &&
                <i className=" ml-auto bi bi-trash btn btn-danger" onClick={() => { removeEnvVarsCard(id) }}></i>}
        </div>)
    }

    const [envVarsCards, setEnvVarsCards] = useState([envVarsCard(0)])

    const AddEnvVarsCard = () => {
        const randomIndex = (Math.random()).toString(36).substring(4);
        setEnvVarsCards([...envVarsCards, envVarsCard(randomIndex)])
    }

    const handleFieldChange = (id) => {
        setAmplifyApp((prev) => (
            {
                ...prev,
                environmentVariables: {
                    ...prev.environmentVariables,
                    [id]: document.getElementById(`key-${id}`).value + " " + document.getElementById(`value-${id}`).value,
                }
            }));
    };

    const removeEnvVarsCard = (id) => {
        // Remove the content, Create a copy of environmentVariables
        setAmplifyApp((prev) => {
            const updatedEnvironmentVariables = { ...prev.environmentVariables };
            // Iterate over the keys of environmentVariables
            for (const key in updatedEnvironmentVariables) {
                if (key === id) {
                    // Remove the key from the updatedEnvironmentVariables object
                    delete updatedEnvironmentVariables[key];
                    break; // Stop iterating once the key is found and removed
                }
            }
            // Return the updated state with the modified environmentVariables
            return {
                ...prev,
                environmentVariables: updatedEnvironmentVariables
            };
        })

        //  Remove the card
        setEnvVarsCards((prevState) => {
            // Find the index of the card with the specified key
            const key = prevState.findIndex((card) => card.key === id);
            // If the key is not found, return the previous state unchanged
            if (key === -1) {
                return prevState;
            }
            // Remove the card with the found index
            return prevState.filter((_, i) => i !== key);
        });
    }

    // API Creation of App
    const handleCreateAmplifyApp = async (e) => {
        e.preventDefault();
        setTerminalOutput("");
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        // If repository URL not valide
        if (!valideGithubRepository(amplifyApp.githubLink)) {
            setWarning({
                message: "something went wrong, please verify the repository URL",
                type: "danger",
                isShown: true
            })
            return;
        }

        let envVars = {}
        // Extract  key: key value  to   key value
        for (const [key, value] of Object.entries(amplifyApp.environmentVariables)) {
            const indexOfSpace = value.indexOf(" ");
            const newKey = value.substring(0, indexOfSpace);
            const newValue = value.substring(indexOfSpace + 1);
            if (newKey != "" && newValue != "") {
                envVars = { ...envVars, [newKey]: newValue };
            }
        }
        envVars = JSON.stringify(envVars)

        try {
            const amplifyAppConfiguration = new FormData();
            amplifyAppConfiguration.append("token", token); // Token authentication
            envVars != "" && amplifyAppConfiguration.append("environmentVariables", envVars) // env vars if not empty
            for (const key in amplifyApp) {
                if (amplifyApp.hasOwnProperty(key) && key != "environmentVariables") {
                    amplifyAppConfiguration.append(key, amplifyApp[key]);
                }
            }

            const response = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_ADDR + "terraform/aws/amplify/",
                {
                    method: "POST",
                    body: amplifyAppConfiguration,
                }
            );

            const data = await response.json();

            if (response.ok) {
                setWarning({
                    message: `The Application ${amplifyApp.appName} has been deployed on Amplify successfully, please note that the CI/CD will work on from the next commit`,
                    type: "success",
                    isShown: true
                });
                setTerminalOutput(data.stdOut);
            } else {
                setWarning({
                    message: "something went wrong, please try again later or contact support [error : 728]",
                    type: "danger",
                    isShown: true
                });
                setTerminalOutput(data.stdErr);
            }
        } catch (err) {
            console.error("something went wrong\n" + err);
            setWarning({
                message: "something went wrong, please try again later or contact support [error : 688]",
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
                                    <form onSubmit={handleCreateAmplifyApp}>
                                        <h3 className="text-center h3 mb-2 mx-1 mx-md-4 row">
                                            <p>Deploy an application</p>
                                            <button
                                                className="btn btn-light btn-lg ml-auto" title="Reset">
                                                <i className="bi bi-trash3-fill cursor-pointer"
                                                    onClick={() => {
                                                        setAmplifyApp(INIT.amplifyApp);
                                                        setDisabled(INIT.disabled);
                                                        setCreateButtonContent(<span>Create</span>)
                                                    }}></i></button>
                                        </h3>

                                        <label className="form-label">
                                            account
                                        </label>
                                        <select
                                            type="text"
                                            id="account"
                                            name="account"
                                            value={amplifyApp.account}
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

                                        <Separation desc="application" />

                                        <label className="form-label">
                                            region
                                        </label>
                                        <select
                                            type="text"
                                            id="region"
                                            name="region"
                                            value={amplifyApp.region}
                                            disabled={disabled.region}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose an installation region</option>
                                            {regions.map((region, index) => (
                                                <option key={index} value={region}>{region}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <label className="form-label">
                                            Application name
                                        </label>
                                        <input
                                            type="text"
                                            id="appName"
                                            name="appName"
                                            className="form-select w-100 bg-light border-0"
                                            value={amplifyApp.appName}
                                            minLength={6}
                                            maxLength={32}
                                            onChange={handleInputChange}
                                            placeholder="Atlas-Cloud-Services"
                                            disabled={disabled.appName}
                                            required
                                        />

                                        <br />
                                        <br />
                                        <label className="form-label">
                                            Technology
                                        </label>
                                        <select
                                            id="appTechnology"
                                            name="appTechnology"
                                            className="form-select w-100 bg-light border-0"
                                            value={amplifyApp.appTechnology}
                                            disabled={disabled.appTechnology}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose the application&apos;s technology</option>
                                            {chooseFrom.technologies.map((technology, index) => (
                                                <option key={index} value={technology} disabled={disabled.appTechnology}>
                                                    {technology !== "Static" ? technology : technology + " website (must contain index.html at /, no builds)"}
                                                </option>

                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <label className="form-label">
                                            github link
                                        </label>
                                        <input
                                            type="text"
                                            id="githubLink"
                                            value={amplifyApp.githubLink}
                                            disabled={disabled.githubLink}
                                            minLength={16}
                                            maxLength={96}
                                            name="githubLink"
                                            placeholder="https://github.com/johndoe/portfolio"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            github
                                        </label>
                                        <select
                                            type="password"
                                            id="gitAccount"
                                            value={amplifyApp.gitAccount}
                                            disabled={disabled.gitAccount}
                                            name="gitAccount"
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        > <option value="" defaultValue disabled>choose an existant account</option>
                                            {chooseFrom.accounts.map(name => (
                                                name.startsWith("git") &&
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <Separation desc="environment variables" />
                                        <div className="d-flex column w-100  my-1">
                                            <p className="w-25 ml-2">Key</p>
                                            <p className="">Value</p>
                                        </div>

                                        {envVarsCards.map((card, index) => card)}

                                        <div className="text-right text-light my-4"><i className="bi bi-plus-circle-fill btn btn-success" onClick={AddEnvVarsCard}></i></div>
                                        <br />
                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                                disabled={!(createButtonContent.props.children === "Create")}
                                            >{createButtonContent}
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
