import { useState, useEffect, useContext, version } from "react";
import { AuthContext } from "@/pages/_app";
import { sizes, locations, getVNs, getSubnets, getSecurityGroups, getResourceGroups, getSSHKeys } from "@/utils/azure";
import { getCredentials, Separation, validateMPassword } from "@/utils/general";
import Downloader from "@/comps/Downloader";

export default function CreateVM({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState({ terraform: false });


    const INIT = {
        DB: {
            account: "",
            location: "",
            resourceGroup: "",
            serverName: "",
            sqlVersion: "",
            sqlDbName: "",
            adminUsername: "",
            adminPassword: "",
        },
        DISABLED: {
            location: true,
            resourceGroup: true,
            serverName: true,
            sqlDbName: true,
            adminUsername: true,
            adminPassword: true,
            sqlVersion: true,
        },
        sqlVersions: ["12.0", "2.0"]
    };

    // VM configuration
    const [db, setDB] = useState(INIT.DB)
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
    const dbArray = Object.keys(db);
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        name == "account" && setDB(INIT.DB)

        const index = dbArray.indexOf(name);

        // Update the value
        setDB((prev) => ({ ...prev, [name]: value }));

        //  Activate next field
        (index !== -1) && setDisabled((prev) => ({ ...prev, [dbArray[index + 1]]: false }))

        switch (name) {
            case "account":
                // If account is changed,  erase all previous config
                setChooseFrom(prev => ({
                    accounts: prev.accounts,
                    ...Object.keys(prev).reduce((acc, key) => key === "accounts" ? acc : { ...acc, [key]: [] }, {})
                }));
                break;
            case "location":
                getResourceGroups(token, db.account, value, setChooseFrom) // Value = db.location
                break;
            default:
                break;

        }



    };

    const handleCreateDB = async (e) => {
        e.preventDefault();
        setTerminalOutput({ terraform: false });
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);
        try {
            const DBConfig = new FormData();
            DBConfig.append("token", token); // Token authentication


            for (const key in db) {
                DBConfig.append(key, db[key]);
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/azure/sql/`,
                {
                    method: "POST",
                    body: DBConfig,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your SQL Database has been created successfully",
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
            console.error(err);
            console.error("something went wrong");
            setWarning({
                message: "something went wrong, please try again later or contact support [error : 323]",
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
                                    <form onSubmit={handleCreateDB}>
                                        <h3 className="text-center h3 mb-2 mx-1 mx-md-4 row">
                                            <p>create a database</p>
                                            <button
                                                className="btn btn-light btn-lg ml-auto" title="Reset">
                                                <i className="bi bi-trash3-fill cursor-pointer"
                                                    onClick={() => {
                                                        setDB(INIT.DB);
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
                                            value={db.account}
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
                                            value={db.location}
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
                                            value={db.resourceGroup}
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
                                            SQL server name
                                        </label>
                                        <input
                                            type="text"
                                            id="serverName"
                                            disabled={disabled.serverName}
                                            value={db.serverName}
                                            name="serverName"
                                            pattern="^([a-z0-9])+([a-z0-9-])*$"
                                            placeholder="my-web-server"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <br />
                                        <label className="form-label">
                                            SQL version
                                        </label>

                                        <select
                                            type="text"
                                            id="sqlVersion"
                                            name="sqlVersion"
                                            value={db.sqlVersion}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            disabled={disabled.sqlVersion}
                                            required
                                        >
                                            <option value="" defaultValue disabled>choose an SQL server version</option>
                                            {INIT.sqlVersions.map(version => (
                                                <option key={version} value={version}>{version}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <label className="form-label">
                                            Database name
                                        </label>
                                        <input
                                            type="text"
                                            id="sqlDbName"
                                            disabled={disabled.sqlDbName}
                                            value={db.sqlDbName}
                                            pattern="^[a-zA-Z0-9][a-zA-Z0-9-]{6,127}$"
                                            title="6 characters at least, alphanumeric charactersand hiphens only."
                                            name="sqlDbName"
                                            placeholder="Univesity-VI"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <Separation desc="Pre-configuration" />
                                        <label className="form-label">
                                            Admin username
                                        </label>
                                        <input
                                            type="text"
                                            id="adminUsername"
                                            name="adminUsername"
                                            disabled={disabled.adminUsername}
                                            value={db.adminUsername}
                                            placeholder="Admin"
                                            pattern="^[a-zA-Z0-9_@.]{1,128}$"
                                            className="form-control mb-3"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <label className="form-label">
                                            Admin password
                                        </label>
                                        <input
                                            type="password"
                                            id="adminPassword"
                                            name="adminPassword"
                                            disabled={disabled.adminPassword}
                                            value={db.adminPassword}
                                            pattern="^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,32}$"
                                            placeholder="P@$$word_1443"
                                            title="✦ Contains at least one lowercase letter (a-z)&#10;
                                            ✦ Contains at least one uppercase letter (A-Z)
                                            ✦ Contains at least one digit (0-9)&#10;
                                            ✦ Contains at least one special character from the set: @$!%*?&&#10;
                                            ✦ Is at least 8 characters long"
                                            className="form-control mb-4"
                                            onChange={handleInputChange}
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



