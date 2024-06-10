import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "@/pages/_app";
import { zones, sizes } from "@/utils/gcp"
import { getCredentials, Separation } from "@/utils/general";
import Downloader from "@/comps/Downloader";
import { getVPCs, getSubnets } from "@/utils/gcp";


export default function CreateCE({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState({ terraform: false });


    const INIT = {
        softwares: ["apache2", "nginx", "java 17", "mongodb", "tomcat", "docker"],
        ce: {
            account: "",
            zone: "",
            vpc: "",
            subnet: "",
            instanceSize: "",
            serverName: "",
            diskSize: "",
            toInstall: "",
            githubLink: "",
            autoPublicIp: true,
        },
        disabled: {
            zone: true,
            vpc: true,
            subnet: true,
            instanceSize: true,
            serverName: true,
            diskSize: true,
            toInstall: true
        }
    };

    // CE configuration
    const [ce, setCE] = useState(INIT.ce)
    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState(INIT.disabled)
    // Disable Create button 

    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>
    );


    // Items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
        vpcs: [],
        subnets: [],
    })


    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) {
                setToken("expired")
            }
        });

    }, [token, setToken]); // token variation for re-execution


    // Can not be optimized cause, calling functions time to time
    const ceArray = Object.keys(ce);
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        name == "account" && setCE(INIT.ce)

        const index = ceArray.indexOf(name);

        // Update the value
        setCE((prev) => ({ ...prev, [name]: value }));

        //  Activate next field
        (index !== -1) && setDisabled((prev) => ({ ...prev, [ceArray[index + 1]]: false }))

        switch (name) {
            case "account":
                // If account is changed,  erase all previous config
                setChooseFrom(prev => ({
                    accounts: prev.accounts,
                    ...Object.keys(prev).reduce((acc, key) => key === "accounts" ? acc : { ...acc, [key]: [] }, {})
                }));
                break;
            case "zone":
                getVPCs(token, ce.account, value, setChooseFrom) // Value = ce.location
                break;
            case "vpc":
                getSubnets(token, ce.account, ce.zone, setChooseFrom, value) // value = ce.subnet
            default:
                break;

        }



    };

    const handleCreateCE = async (e) => {
        e.preventDefault();
        setTerminalOutput({ terraform: false });
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        try {
            const ceConfig = new FormData();
            ceConfig.append("token", token); // Token authentication


            for (const key in ce) {
                ceConfig.append(key, ce[key]);
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/gcp/ce/`,
                {
                    method: "POST",
                    body: ceConfig,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your CE has been created successfully",
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
                setTerminalOutput({
                    terraform: data.stdErr
                });
            }
        } catch (err) {
            console.error("something went wrong");
            setWarning({
                message: "something went wrong, please try again later or contact support [error : 728]",
                type: "danger",
                isShown: true
            });
        } finally {
            setCreateButtonContent(<span>Create</span>)
        }
    };

    return (
        <div className=" d-flex align-items-center justify-content-center p-5 tilt-warp-title">
            <div className="row d-flex justify-content-center align-items-center col-xl-5 col-lg-6 col-md-8 col-sm-10 col-xs-12">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
                    <div
                        className="bg-transparent text-dark rounded"
                    >
                        <div className="card-body p-md-5">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <form onSubmit={handleCreateCE}>
                                        <h3 className="text-center d-flex flex-row">
                                            <p>create an CE</p>
                                            <button
                                                className="btn btn-light btn-lg ml-auto" title="Reset">
                                                <i className="bi bi-trash3-fill cursor-pointer"
                                                    onClick={() => {
                                                        setCE(INIT.ce);
                                                        setDisabled(INIT.disabled);
                                                        setChooseFrom((prev) => ({
                                                            accounts: prev.accounts,
                                                            vpcs: [],
                                                            subnets: [],
                                                            securityGroups: [],
                                                            sSHKeys: []
                                                        }))
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
                                            value={ce.account}
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
                                            Zone
                                        </label>
                                        <select
                                            type="text"
                                            id="zone"
                                            name="zone"
                                            value={ce.zone}
                                            disabled={disabled.zone}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose an installation zone</option>
                                            {zones.map((zone, index) => (
                                                <option key={index} value={zone}>{zone}</option>
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
                                            value={ce.vpc}
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
                                            subnet
                                        </label>
                                        <select
                                            id="subnet"
                                            name="subnet"
                                            className="form-select w-100 bg-light border-0"
                                            value={ce.subnet}
                                            disabled={disabled.subnet}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a subnet</option>
                                            {chooseFrom.subnets.length > 0 &&
                                                (chooseFrom.subnets
                                                    .map((subnet, index) => (
                                                        <option key={index} value={subnet.name} disabled={subnet.cidrBlock === '-'}>
                                                            {subnet.name}&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;
                                                            {subnet.cidrBlock}
                                                        </option>

                                                    )))}
                                        </select>
                                        <br />
                                        <br />
                                        <Separation desc="Instance" />
                                        <label className="form-label my-4">
                                            <input
                                                type="checkbox"
                                                style={{ accentColor: "black" }}
                                                checked={ce.autoPublicIp}
                                                disabled={disabled.autoPublicIp}
                                                onChange={() => { setCE((prev) => ({ ...prev, autoPublicIp: !prev.autoPublicIp })); }}
                                            />
                                            <span className="mx-1">Assign public IP Address</span>
                                        </label>

                                        <label className="form-label">
                                            instance size
                                        </label>
                                        <select
                                            type="text"
                                            id="instanceSize"
                                            name="instanceSize"
                                            value={ce.instanceSize}
                                            disabled={disabled.instanceSize}
                                            aria-label="Instance Size"
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a size</option>
                                            {sizes.map((size, index) => (
                                                <option key={index} value={size}>{size}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <label className="form-label">
                                            server name
                                        </label>
                                        <input
                                            type="text"
                                            id="serverName"
                                            value={ce.serverName}
                                            name="serverName"
                                            disabled={disabled.serverName}
                                            placeholder="my-web-server"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <br />
                                        <label className="form-label">
                                            Disk size (GBs)
                                        </label>
                                        <input
                                            type="range"
                                            id="diskSize"
                                            value={ce.diskSize}
                                            min={10}
                                            max={256}
                                            disabled={disabled.diskSize}
                                            name="diskSize"
                                            className="form-control me-2"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <div className="d-flex flex-row align-items-center">
                                            <input
                                                type="text"
                                                value={ce.diskSize}
                                                className="form-control"
                                                onChange={handleInputChange}
                                                disabled
                                            />
                                            <span className="ml-2">GBs</span>
                                        </div>

                                        <br />
                                        <label className="form-label">Preinstall software</label>
                                        <select
                                            id="toInstall"
                                            name="toInstall"
                                            className="form-select w-100 bg-light border-0"
                                            value={ce.toInstall}
                                            disabled={disabled.toInstall}
                                            onChange={handleInputChange}
                                        >
                                            <option value="" disabled>choose a software to install</option>
                                            <option value="nothing">don&apos;t install anything</option>
                                            {INIT.softwares.map((software, index) => (
                                                <option key={index} value={software}>{software}</option>
                                            ))}
                                        </select>


                                        {ce.toInstall === "apache2" && (
                                            <>
                                                <label className="form-label">GitHub link - Deploy http<i title="must contain an index.html file on the root directory" className="ml-2 bi bi-question-circle-fill cursor-pointer"></i></label>
                                                <input
                                                    type="text"
                                                    id="githubLink"
                                                    value={ce.githubLink}
                                                    name="githubLink"
                                                    placeholder="https://www.github.com/johndoe/portfolio"
                                                    className="form-control mb-2"
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                <div className="mt-3 alert alert-warning" role="alert">
                                                    make sure that the subnet is public, and that the ports you need are open including SSH (22).
                                                </div>
                                            </>
                                        )}

                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                                disabled={!(createButtonContent.props.children === 'Create') || disabled.toInstall}
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
                                    {
                                        terminalOutput.terraform && (
                                            <>
                                                <h4 className="mt-3"> output : </h4>
                                                <div className="bg-black text-terminal h6 rounded my-1 p-4"
                                                    style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                                    {terminalOutput.terraform}
                                                </div>
                                            </>)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}



