import { useState, useEffect, useContext, version } from "react";
import { AuthContext } from "@/pages/_app";
import { regions, dbSizes, postgresVersions } from "@/utils/gcp";
import { getCredentials, Separation } from "@/utils/general";

const INIT = {
    db: {
        account: "",
        region: "",
        tier: "",
        pricingPlan: "",
        version: "",
        deletion_protection: false,
        diskSize: 30,
        autoResize: false,
        maxDiskSize: 60,
        username: "",
        password: "",
    },
    disabled: {
        account: false,
        region: true,
        tier: true,
        pricingPlan: true,
        version: true,
        diskSize: true,
        username: true,
        password: true,
    },
};

export default function CreateMySQL({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState({ terraform: false });
    const [db, setDB] = useState(INIT.db);
    const [disabled, setDisabled] = useState(INIT.disabled);
    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>
    );

    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
    });

    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) {
                setToken("expired");
            }
        });
    }, [token, setToken]);

    const dbArray = Object.keys(INIT.disabled);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "account") {
            setDB(INIT.db);
        }

        const index = dbArray.indexOf(name);

        setDB((prev) => ({ ...prev, [name]: value }));
        if (index !== -1) {
            setDisabled((prev) => ({ ...prev, [dbArray[index + 1]]: false }));
        }

        switch (name) {
            case "account":
                setChooseFrom((prev) => ({
                    accounts: prev.accounts,
                    ...Object.keys(prev).reduce(
                        (acc, key) => (key === "accounts" ? acc : { ...acc, [key]: [] }),
                        {}
                    ),
                }));
                break;
            default:
                break;
        }
    };

    const handleCreateDB = async (e) => {
        e.preventDefault();
        setTerminalOutput({ terraform: false });
        setCreateButtonContent(
            <span>
                <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                ></span>{" "}
                please wait
            </span>
        );

        try {
            const dbConfig = new FormData();
            dbConfig.append("token", token);

            for (const key in db) {
                dbConfig.append(key, db[key]);
            }
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/gcp/sql/`,
                {
                    method: "POST",
                    body: dbConfig,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your Database has been created successfully",
                    type: "success",
                    isShown: true,
                });
                setTerminalOutput({
                    terraform: data.stdOut,
                });
            } else {
                setWarning({
                    message: "Something went wrong, see the console for more information",
                    type: "danger",
                    isShown: true,
                });
                setTerminalOutput({
                    terraform: data.stdErr,
                });
            }
        } catch (err) {
            console.error("Something went wrong");
            setWarning({
                message:
                    "Something went wrong, please try again later or contact support.",
                type: "danger",
                isShown: true,
            });
        } finally {
            setCreateButtonContent(<span>Create</span>);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center p-5 tilt-warp-title">
            <div className="row d-flex justify-content-center align-items-center col-xl-5 col-lg-6 col-md-8 col-sm-10 col-xs-12">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
                    <div className="bg-transparent text-dark rounded">
                        <div className="card-body p-md-5">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <form onSubmit={handleCreateDB}>
                                        <h3 className="text-center d-flex flex-row">
                                            <p>create a PostgreSQL DB</p>
                                            <button
                                                className="btn btn-light btn-lg ml-auto"
                                                title="Reset"
                                                type="button"
                                                onClick={() => {
                                                    setDB(INIT.db);
                                                    setDisabled(INIT.disabled);
                                                    setChooseFrom((prev) => ({
                                                        accounts: prev.accounts,
                                                    }));
                                                    setCreateButtonContent(<span>Create</span>);
                                                }}
                                            >
                                                <i className="bi bi-trash3-fill cursor-pointer"></i>
                                            </button>
                                        </h3>
                                        <p className="alert alert-info m-2 mt-4">
                                            <i className="bi bi-info-circle mr-2"></i>
                                            It may take up to 10 minutes to create a Database properly.
                                        </p>

                                        <label className="form-label">Account</label>
                                        <select
                                            id="account"
                                            name="account"
                                            value={db.account}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>
                                                choose an existant account
                                            </option>
                                            {chooseFrom.accounts.map(
                                                (name) =>
                                                    name.startsWith("gcp") && (
                                                        <option key={name} value={name}>
                                                            {name}
                                                        </option>
                                                    )
                                            )}
                                        </select>
                                        <br />
                                        <br />

                                        <Separation desc="Placement" />

                                        <label className="form-label">Region</label>
                                        <select
                                            id="region"
                                            name="region"
                                            value={db.region}
                                            disabled={disabled.region}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>
                                                Choose an installation region
                                            </option>
                                            {regions.map((region, index) => (
                                                <option key={index} value={region}>
                                                    {region}
                                                </option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <Separation desc="Database" />

                                        <label className="form-label">Tier</label>
                                        <select
                                            id="tier"
                                            name="tier"
                                            className="form-select w-100 bg-light border-0"
                                            value={db.tier}
                                            onChange={handleInputChange}
                                            disabled={disabled.tier}
                                            required
                                        >
                                            <option value="" defaultValue disabled>
                                                Choose a tier
                                            </option>
                                            {dbSizes.map((tier, index) => (
                                                <option
                                                    key={index}
                                                    value={tier.name}
                                                >
                                                    {tier.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    {tier.memory} / {tier.cpu}
                                                </option>

                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <label className="form-label">Pricing Plan</label>
                                        <select
                                            id="pricingPlan"
                                            name="pricingPlan"
                                            className="form-select w-100 bg-light border-0"
                                            value={db.pricingPlan}
                                            disabled={disabled.pricingPlan}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>
                                                Choose a Pricing Plan
                                            </option>
                                            <option value="PER_USE">PER_USE</option>
                                            <option value="PACKAGE">PACKAGE</option>
                                        </select>
                                        <br />
                                        <br />

                                        <label className="form-label">Version</label>
                                        <select
                                            id="version"
                                            name="version"
                                            className="form-select w-100 bg-light border-0"
                                            value={db.version}
                                            disabled={disabled.version}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>
                                                Choose a version
                                            </option>
                                            {postgresVersions.map((version, index) => (
                                                <option key={index} value={version}>
                                                    {version}
                                                </option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <label className="form-label">Database</label>
                                        <input
                                            type="text"
                                            id="dbName"
                                            value={db.dbName}
                                            name="dbName"
                                            disabled={disabled.dbName}
                                            placeholder="promptify web app art"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <br />

                                        <label className="form-label">Disk Size (GBs)</label>
                                        <div className="d-flex flex-row">
                                            <input
                                                type="range"
                                                id="diskSize"
                                                value={db.diskSize}
                                                min={30}
                                                max={256}
                                                disabled={disabled.diskSize}
                                                name="diskSize"
                                                className="form-control mr-2"
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <input className="ml-auto w-25" onChange={()=>{return null}} value={db.diskSize}></input>
                                        </div>
                                        <label className="form-label my-4">
                                            <input
                                                type="checkbox"
                                                style={{ accentColor: "black" }}
                                                checked={db.autoResize}
                                                onChange={() => {
                                                    setDB((prev) => ({
                                                        ...prev,
                                                        autoResize: !prev.autoResize,
                                                    }));
                                                }}
                                            />
                                            <span className="mx-1">Enable Auto Resize</span>
                                        </label>
                                        <br />
                                        {db.autoResize && (
                                            <>
                                                <label className="form-label">Max Disk Size (GBs)</label>
                                                <div className="d-flex flex-row">
                                                    <input
                                                        type="range"
                                                        id="maxDiskSize"
                                                        value={db.maxDiskSize}
                                                        min={db.diskSize}
                                                        max={512}
                                                        name="maxDiskSize"
                                                        className="form-control mr-2"
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <input className="ml-auto w-25" onChange={()=>{return null}} value={db.maxDiskSize}></input>
                                                </div>
                                            </>
                                        )}
                                        <br />
                                        <Separation desc="Access" />

                                        <label className="form-label">Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            value={db.username}
                                            name="username"
                                            placeholder="api provider"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />

                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            id="password"
                                            value={db.password}
                                            name="password"
                                            placeholder="c0mp|3x3_P@$$w0rd"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />

                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                                disabled={
                                                    !(
                                                        createButtonContent.props.children === "Create"
                                                    ) || disabled.toInstall
                                                }
                                            >
                                                {createButtonContent}
                                            </button>
                                        </div>

                                        {!(createButtonContent.props.children === "Create") && (
                                            <div className="mt-5 d-flex justify-content-center">
                                                <div className="text-dark mx-4">
                                                    We are working on it ...
                                                </div>
                                                <div className="factory-loader"></div>
                                            </div>
                                        )}
                                        <br />
                                    </form>
                                    {terminalOutput.terraform && (
                                        <>
                                            <h4 className="mt-3">Output:</h4>
                                            <div
                                                className="bg-black text-terminal h6 rounded my-1 p-4"
                                                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                                            >
                                                {terminalOutput.terraform}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
