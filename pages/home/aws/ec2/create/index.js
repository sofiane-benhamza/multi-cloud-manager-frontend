import { useState, useEffect, useContext, useRef } from "react";
import { FullContext } from "../../../../_app";
import { getCredentials, getVPCs, getSubnets, getSecurityGroups, getSSHKeys, sizes, regions, separation } from "../../../../../utils/functions";

export default function CreateEC2({ setWarning, setToken }) {
    const { token } = useContext(FullContext);

    const [terminalOutput, setTerminalOutput] = useState("");


    const INIT = {
        softwares: ["apache2", "nginx", "java 17", "mongodb", "tomcat", "docker"],
        ec2: {
            account: "",
            sSHKeyName: "",
            instanceSize: "",
            serverName: "",
            region: "",
            vPC: "",
            subnet: "",
            securityGroupe: "",
            autoPublicIp: true,
            toInstall: "nothing",
            githubLink: ""
        },
        disabled: {
            region: true,
            vPC: true,
            subnet: true,
            securityGroupe: true,
        }
    };

    // EC2 configuration
    const [eC2, setEC2] = useState(INIT.ec2)
    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState(INIT.disabled)
    // Disable Create button 

    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>
    );


    // Items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
        vPCs: [],
        subnets: [],
        securityGroups: [],
        sSHKeys: []
    })

    // Checkbox configuration
    const [createSSHKey, setCreateSSHKey] = useState(true)  //tracking checkbox
    const [createSSHKeyName, setCreateSSHKeyName] = useState("")  //key name to be created
    const keyNameRef = useRef(null);                     //reference of input of keyname


    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) {
                setToken("expired")
            }
        });

    }, []); // token variation for re-execution


    // Can not be optimized cause, calling functions time to time
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setDisabled(prevConfig => ({
            ...prevConfig,
            name: true
        }));

        switch (name) {
            case "account":
                setEC2(INIT.ec2)
                setChooseFrom(prev => ({
                    accounts: prev.accounts,
                    ...Object.keys(prev).reduce((acc, key) => key === "accounts" ? acc : { ...acc, [key]: [] }, {})
                }));           // If account is changed,  erase all previous config
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    region: false
                }));
                getSSHKeys(token, value, setChooseFrom);
                break;
            case "region":
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    vPC: false,
                }));
                getVPCs(token, value, eC2.account, setChooseFrom); //fetch all vPCs inside region from backend
                getSecurityGroups(token, value, eC2.account, setChooseFrom); //fetch all sgs inside region from backend
                break;
            case "vPC":
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    subnet: false,
                    securityGroupe: false
                }));
                getSubnets(token, eC2.region, eC2.account, setChooseFrom);
                break;
            case "subnet":
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    region: false
                }));
                break;
            default:
                break;

        }
        setEC2((prevConfig) => ({ ...prevConfig, [name]: value }));

    };

    const handleCreateEC2 = async (e) => {
        e.preventDefault();
        setTerminalOutput("")
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        let SSHKeyIsUnique = !chooseFrom.sSHKeys.includes(createSSHKeyName);  // Same key name at aws will failed, checked here
        if (!SSHKeyIsUnique) {
            setWarning({
                message: "SSH key name already exists, please choose another key name",
                type: "danger",
                isShown: true
            });
            return;
        }

        try {
            const eC2Configuration = new FormData();
            eC2Configuration.append("token", token); //token authentication

            for (const key in eC2) {
                if (eC2.hasOwnProperty(key) && key !== "sSHKeyName") {
                    eC2Configuration.append(key, eC2[key]);
                }
            }

            createSSHKey ? eC2Configuration.append("newSSHKeyName", createSSHKeyName) : eC2Configuration.append("existantSSHKeyName", sSHKeyName);//append here if create or choose

            const response = await fetch(
                "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/terraform/aws/ec2/",
                {
                    method: "POST",
                    body: eC2Configuration,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your EC2 has been created successfully",
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
            <div className="row d-flex justify-content-center align-items-center col-xl-4 col-lg-4 col-md-8 col-sm-10 col-xs-12">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
                    <div
                        className="bg-transparent text-dark rounded"
                    >
                        <div className="card-body p-md-5 ">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <form onSubmit={handleCreateEC2}>
                                        <h3 className="text-center h3 mb-2 mx-1 mx-md-4 row">
                                            <p>create an EC2</p>
                                            <button
                                                className="btn btn-light btn-lg ml-auto" title="Reset">
                                                <i className="bi bi-trash3-fill cursor-pointer"
                                                    onClick={() => {
                                                        setEC2(INIT.ec2);
                                                        setDisabled(INIT.disabled);
                                                        setChooseFrom((prev) => ({
                                                            accounts: prev.accounts,
                                                            vPCs: [],
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
                                            value={eC2.account}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        > <option value="" defaultValue disabled>choose an existant account</option>
                                            {chooseFrom.accounts.map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        {separation("placement")}

                                        <label className="form-label">
                                            region
                                        </label>
                                        <select
                                            type="text"
                                            id="region"
                                            name="region"
                                            value={eC2.region}
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
                                            virtual private cloud
                                        </label>
                                        <select
                                            id="vPC"
                                            name="vPC"
                                            className="form-select w-100 bg-light border-0"
                                            value={eC2.vPC}
                                            onChange={handleInputChange}
                                            disabled={disabled.vPC}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a VPC</option>
                                            {chooseFrom.vPCs.length > 0 ? chooseFrom.vPCs.map(vPC => (
                                                <option key={vPC['VPC ID']} value={vPC['VPC ID']} >
                                                    {vPC['VPC ID']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    {vPC['CIDR Block']}
                                                </option>


                                            )) : <option disabled>there is no VPCs in the current region</option>}
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
                                            value={eC2.subnet}
                                            disabled={disabled.subnet}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a subnet</option>
                                            {chooseFrom.subnets.length > 0 ?
                                                (chooseFrom.subnets
                                                    .filter(subnet => (subnet["VPC ID"] == eC2.vPC || subnet["VPC ID"] === '-'))
                                                    .map(subnet => (
                                                        <option key={subnet['Subnet ID']} value={subnet['Subnet ID']} disabled={subnet['VPC ID'] === '-'}>
                                                            {subnet['Subnet ID']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            {subnet['CIDR Block']}
                                                        </option>

                                                    ))) : null}
                                        </select>
                                        <br />
                                        <br />


                                        <label className="form-label">
                                            security groupe
                                        </label>
                                        <select
                                            id="securityGroupe"
                                            name="securityGroupe"
                                            className="form-select w-100 bg-light border-0"
                                            value={eC2.securityGroupe}
                                            onChange={handleInputChange}
                                            disabled={disabled.securityGroupe}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a security groupe</option>
                                            {
                                                chooseFrom.securityGroups.length > 0 ? (
                                                    chooseFrom.securityGroups
                                                        .filter(securityGroup => securityGroup['vpcId'] === eC2.vPC)
                                                        .map(securityGroup => (
                                                            <option key={securityGroup['groupId']} value={securityGroup['groupId']}>
                                                                {securityGroup['groupId']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                {securityGroup['groupName']}
                                                            </option>
                                                        ))
                                                ) : (
                                                    <option disabled>There are no Security Groups in the current Region</option>
                                                )
                                            }


                                        </select>
                                        <br />
                                        <br />

                                        {separation("Instance")}
                                        <input
                                            type="checkbox"
                                            onClick={() => {
                                                setEC2((prevConfig) => ({ ...prevConfig, autoPublicIp: !prevConfig.autoPublicIp }))
                                            }}
                                            style={{ accentColor: "black" }} defaultChecked />&nbsp;&nbsp;&nbsp;Auto assign public ipv4 address
                                        <br />
                                        <br />
                                        <select
                                            id="sSHKeyName"
                                            name="sSHKeyName"
                                            className="form-select w-100 bg-light border-0"
                                            value={eC2.sSHKeyName}
                                            onChange={handleInputChange}
                                            disabled={createSSHKey}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose an existant SSH key</option>
                                            {chooseFrom.sSHKeys.map(keyName => (
                                                <option key={keyName} value={keyName} disabled={keyName == 'There is no SSH keys'}>
                                                    {keyName}
                                                </option>
                                            ))}

                                        </select>
                                        <br />

                                        <label className="form-label">
                                            <input
                                                type="checkbox"
                                                style={{ accentColor: "black" }}
                                                checked={createSSHKey}
                                                onChange={() => { setCreateSSHKey(!createSSHKey) }} />
                                            <span className="mx-1">Create new SSH key</span>
                                        </label>

                                        <input
                                            type="text"
                                            id="createSSHKeyName"
                                            name="createSSHKeyName"
                                            value={createSSHKeyName}
                                            ref={keyNameRef}
                                            placeholder="my_custom_SSH_key_name"
                                            className="form-control mb-2"
                                            onChange={(e) => { setCreateSSHKeyName(e.target.value) }}
                                            required={createSSHKey}
                                            disabled={!createSSHKey}
                                        />
                                        <br />

                                        <label className="form-label">
                                            instance size
                                        </label>
                                        <select
                                            type="text"
                                            id="instanceSize"
                                            name="instanceSize"
                                            value={eC2.instanceSize}
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
                                            value={eC2.serverName}
                                            name="serverName"
                                            placeholder="my-web-server"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <br />

                                        <label className="form-label">
                                            preinstall software
                                        </label>
                                        <select
                                            id="toInstall"
                                            name="toInstall"
                                            className="form-select w-100 bg-light border-0"
                                            value={eC2.toInstall}
                                            onChange={handleInputChange}
                                        >
                                            <option value="nothing" disabled>Choose a software to install</option>
                                            {INIT.softwares.map((software, index) => (
                                                <option key={index} value={software}>{software}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        {eC2.toInstall === "apache2" && (
                                            <>
                                                <label className="form-label">
                                                    github link
                                                </label>
                                                <input
                                                    type="text"
                                                    id="githubLink"
                                                    value={eC2.githubLink}
                                                    name="githubLink"
                                                    placeholder="https://www.github.com/johndoe/portfolio"
                                                    className="form-control mb-2"
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </>)}

                                        <br />
                                        <br />
                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                                disabled={!(createButtonContent.type === 'span' && createButtonContent.props.children === 'Create')}
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
