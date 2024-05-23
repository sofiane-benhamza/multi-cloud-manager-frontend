import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/pages/_app";
import { sizes, locations, getVNs, getSubnets, getSecurityGroups, getResourceGroups, getSSHKeys } from "@/utils/azure";
import { getCredentials, Separation, validateMPassword } from "@/utils/general";
import Downloader from "@/comps/Downloader";

export default function CreateVM({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState({ terraform: false, ssh: "" });


    const INIT = {
        softwares: ["apache2", "nginx", "java 17", "mongodb", "tomcat", "docker"],
        VM: {
            account: "",
            location: "",
            resourceGroup: "",
            vn: "",
            subnet: "",
            securityGroup: "",
            vmSize: "",
            serverName: "",
            osDiskName: "",
            osDiskSize: "",
            adminUsername: "",
            adminPassword: "",
            toInstall: "",
            autoPublicIp: true,
            githubLink: "",
            createNewSSHKey: false,
            existentSSHKeyName: "",
            newSSHKeyName: "",
            disablePasswordAuthentication: false
        },
        DISABLED: {
            location: true,
            resourceGroup: true,
            vn: true,
            subnet: true,
            securityGroup: true,
            vmSize: true,
            serverName: true,
            osDiskName: true,
            osDiskSize: true,
            toInstall: true,
            adminUsername: true,
            adminPassword: true
        }
    };

    // VM configuration
    const [vm, setVM] = useState(INIT.VM)
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
        vns: [],
        subnets: [],
        securityGroups: [],
        sshKeys: []
    })


    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) {
                setToken("expired")
            }
        });

    }, []); // Token variation for re-execution


    //  Can not be optimized cause, calling functions time to time
    const vmArray = Object.keys(vm);
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        name == "account" && setVM(INIT.VM)

        const index = vmArray.indexOf(name);

        // Update the value
        setVM((prev) => ({ ...prev, [name]: value }));

        //  Activate next field
        (index !== -1) && setDisabled((prev) => ({ ...prev, [vmArray[index + 1]]: false }))

        switch (name) {
            case "account":
                // If account is changed,  erase all previous config
                setChooseFrom(prev => ({
                    accounts: prev.accounts,
                    ...Object.keys(prev).reduce((acc, key) => key === "accounts" ? acc : { ...acc, [key]: [] }, {})
                }));
                break;
            case "location":
                getResourceGroups(token, vm.account, value, setChooseFrom) // Value = vm.location
                break;
            case "resourceGroup":
                getVNs(token, vm.account, vm.location, setChooseFrom, value)  // Value = vm.resourceGroup
                break;
            case "vn":
                getSubnets(token, vm.account, value, setChooseFrom, vm.resourceGroup);  // Value == vm.virtualNetwork == vn
                getSecurityGroups(token, vm.account, vm.resourceGroup, setChooseFrom);
                break;
            case "securityGroup":
                getSSHKeys(token, vm.account, vm.resourceGroup, setChooseFrom)
                break;
            default:
                break;

        }



    };

    const handleCreateVM = async (e) => {
        e.preventDefault();
        setTerminalOutput({ terraform: false, ssh: "" });
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        const SSHKeyIsUnique = !chooseFrom.sshKeys.includes(newSSHKeyName);  // Same key name at aws will failed, checked here
        if (!SSHKeyIsUnique) {
            setWarning({
                message: "SSH key name already exists, please choose another key name",
                type: "danger",
                isShown: true
            });
            return;
        }

        try {
            const VMConfiguration = new FormData();
            VMConfiguration.append("token", token); // Token authentication

            const notToBeSent = ["existentSSHKeyName", "newSSHKeyName", "createNewSSHKey"];

            for (const key in vm) {
                if (vm.hasOwnProperty(key) && !notToBeSent.includes(key)) {
                    VMConfiguration.append(key, vm[key]);
                }
            }

            vm.createNewSSHKey ? VMConfiguration.append("newSSHKeyName", vm.newSSHKeyName) : VMConfiguration.append("existentSSHKeyName", vm.existentSSHKeyName);//append here if create or choose

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/azure/vm/`,
                {
                    method: "POST",
                    body: VMConfiguration,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Your virtual machine has been created successfully",
                    type: "success",
                    isShown: true
                });

                setTerminalOutput({
                    terraform: data.stdOut,
                    ssh: vm.createNewSSHKey ?
                        <Downloader key={Math.random()} content={data.privateSSHKey} name={vm.newSSHKeyName + ".pem"} title={"download private ssh key"} />
                        : ""
                });
            } else {
                setWarning({
                    message: "something went wrong, see the console for more informations",
                    type: "danger",
                    isShown: true
                });
                setTerminalOutput({ terraform: data.stdErr, ssh: "" });
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
                                    <form onSubmit={handleCreateVM}>
                                        <h3 className="text-center h3 mb-2 mx-1 mx-md-4 row">
                                            <p>create an VM</p>
                                            <button
                                                className="btn btn-light btn-lg ml-auto" title="Reset">
                                                <i className="bi bi-trash3-fill cursor-pointer"
                                                    onClick={() => {
                                                        setVM(INIT.VM);
                                                        setDisabled(INIT.DISABLED);
                                                        setChooseFrom((prev) => ({
                                                            accounts: prev.accounts,
                                                            resourceGroups: [],
                                                            vns: [],
                                                            subnets: [],
                                                            securityGroups: [],
                                                            sshKeys: []
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
                                            value={vm.account}
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
                                            value={vm.location}
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
                                            value={vm.resourceGroup}
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
                                            Virtual network
                                        </label>
                                        <select
                                            id="vn"
                                            name="vn"
                                            className="form-select w-100 bg-light border-0"
                                            value={vm.vn}
                                            onChange={handleInputChange}
                                            disabled={disabled.vn}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a vn</option>
                                            {chooseFrom.vns.map(vn => (
                                                <option key={vn['id']} value={vn['name']} disabled={vn['name'].startsWith("there")}>
                                                    {vn['name']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    {vn['cidrBlock']}/{vn['mask']}
                                                </option>


                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <label className="form-label">
                                            Subnet
                                        </label>
                                        <select
                                            id="subnet"
                                            name="subnet"
                                            className="form-select w-100 bg-light border-0"
                                            value={vm.subnet}
                                            disabled={disabled.subnet}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a subnet</option>
                                            {(chooseFrom.subnets
                                                .map(subnet => (
                                                    <option key={subnet['name']} value={subnet['id']} disabled={subnet['cidrBlock'] == '-'}>
                                                        {subnet['name']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        {subnet['cidrBlock']}
                                                    </option>

                                                )))}
                                        </select>
                                        <br />
                                        <br />


                                        <label className="form-label">
                                            Security group
                                        </label>
                                        <select
                                            id="securityGroup"
                                            name="securityGroup"
                                            className="form-select w-100 bg-light border-0"
                                            value={vm.securityGroup}
                                            onChange={handleInputChange}
                                            disabled={disabled.securityGroup}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose a security groupe</option>
                                            {
                                                (
                                                    chooseFrom.securityGroups
                                                        .map(securityGroup => (
                                                            <option key={securityGroup.id} value={securityGroup.id} disabled={securityGroup.id === "-"}>
                                                                {securityGroup.name}
                                                            </option>
                                                        ))
                                                )}


                                        </select>
                                        <br />
                                        <br />

                                        <Separation desc="Instance" />
                                        <input
                                            type="checkbox"
                                            onClick={() => {
                                                setVM((prevConfig) => ({ ...prevConfig, autoPublicIp: !prevConfig.autoPublicIp }))
                                            }}
                                            style={{ accentColor: "black" }} defaultChecked />&nbsp;&nbsp;&nbsp;Auto assign public ipv4 address
                                        <br />
                                        <br />
                                        <select
                                            id="existentSSHKeyName"
                                            name="existentSSHKeyName"
                                            className="form-select w-100 bg-light border-0"
                                            value={vm.existentSSHKeyName}
                                            onChange={handleInputChange}
                                            disabled={vm.createNewSSHKey}
                                            required={!vm.createNewSSHKey}
                                        >
                                            <option value="" defaultValue disabled>Choose an existant SSH key</option>
                                            {chooseFrom.sshKeys.map(keyName => (
                                                <option key={keyName} value={keyName} disabled={keyName.startsWith("there is")}>
                                                    {keyName}
                                                </option>
                                            ))}

                                        </select>
                                        <br />

                                        <label className="form-label">
                                            <input
                                                type="checkbox"
                                                style={{ accentColor: "black" }}
                                                checked={vm.createNewSSHKey}
                                                onChange={() => { setVM((prev) => ({ ...prev, createNewSSHKey: !prev.createNewSSHKey })) }}
                                            />
                                            <span className="mx-1">Create new SSH key</span>
                                        </label>

                                        <input
                                            type="text"
                                            id="newSSHKeyName"
                                            name="newSSHKeyName"
                                            value={vm.newSSHKeyName}
                                            placeholder="my_custom_SSH_key_name"
                                            className="form-control mb-2"
                                            onChange={(e) => { setVM((prev) => ({ ...prev, newSSHKeyName: e.target.value })) }}
                                            required={vm.createNewSSHKey}
                                            disabled={!vm.createNewSSHKey}
                                        />
                                        <br />

                                        <label className="form-label">
                                            instance size
                                        </label>
                                        <select
                                            type="text"
                                            id="vmSize"
                                            name="vmSize"
                                            value={vm.vmSize}
                                            aria-label="Instance Size"
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            disabled={disabled.vmSize}
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
                                            disabled={disabled.serverName}
                                            value={vm.serverName}
                                            name="serverName"
                                            placeholder="my-web-server"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <br />

                                        <label className="form-label">
                                            OS disk  name
                                        </label>
                                        <input
                                            type="text"
                                            id="osDiskName"
                                            disabled={disabled.osDiskName}
                                            value={vm.osDiskName}
                                            name="osDiskName"
                                            placeholder="web-server-storage"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <br />

                                        <label className="form-label">
                                            OS disk  size (gb)
                                        </label>
                                        <input
                                            type="number"
                                            id="osDiskSize"
                                            disabled={disabled.osDiskSize}
                                            value={vm.osDiskSize}
                                            min={30}
                                            max={65536}
                                            name="osDiskSize"
                                            placeholder="45"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <br />
                                        <Separation desc="Pre-configuration" title="New SSH key, opened port 22 and a public IP Address are required" />
                                        <label className="form-label">
                                            Admin username
                                        </label>
                                        <input
                                            type="text"
                                            id="adminUsername"
                                            name="adminUsername"
                                            disabled={disabled.adminUsername}
                                            value={vm.adminUsername}
                                            placeholder="Admin"
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
                                            value={vm.adminPassword}
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

                                        <label className="form-label">
                                            <input
                                                type="checkbox"
                                                style={{ accentColor: "black" }}
                                                checked={vm.disablePasswordAuthentication}
                                                onChange={() => { setVM((prev) => ({ ...prev, disablePasswordAuthentication: !prev.disablePasswordAuthentication })) }}
                                            />
                                            <span className="mx-1">Disable password authentication</span>
                                        </label>
                                        {vm.createNewSSHKey && vm.autoPublicIp && (
                                            <>
                                                <label className="form-label">Preinstall software</label>
                                                <select
                                                    id="toInstall"
                                                    name="toInstall"
                                                    className="form-select w-100 bg-light border-0"
                                                    disabled={disabled.toInstall}
                                                    value={vm.toInstall}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="" disabled>choose a software to install</option>
                                                    <option value="nothing">don't install anything</option>
                                                    {INIT.softwares.map((software, index) => (
                                                        <option key={index} value={software}>{software}</option>
                                                    ))}
                                                </select>
                                                <br />
                                                <br />
                                                {vm.toInstall === "apache2" && (
                                                    <>
                                                        <label className="form-label">GitHub link<i title="must contain an index.html file on the root directory" className="ml-2 bi bi-question-circle-fill cursor-pointer"></i></label>
                                                        <input
                                                            type="text"
                                                            id="githubLink"
                                                            value={vm.githubLink}
                                                            name="githubLink"
                                                            placeholder={`https://www.github.com/johndoe/portfolio`}
                                                            className="form-control mb-2"
                                                            pattern="/^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)(?:\/)?$/"
                                                            onChange={handleInputChange}
                                                        />
                                                    </>
                                                )}
                                                <div className="mt-3 alert alert-warning" role="alert">
                                                    make sure that the subnet is public, and that the ports you need are open including SSH (22).
                                                </div>
                                            </>
                                        )}
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



