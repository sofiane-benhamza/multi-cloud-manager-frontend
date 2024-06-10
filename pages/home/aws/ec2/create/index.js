import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "@/pages/_app";
import { getVPCs, getSubnets, getSecurityGroups, getSSHKeys, sizes, regions } from "@/utils/aws";
import { getCredentials, Separation } from "@/utils/general";
import Downloader from "@/comps/Downloader";



export default function CreateEC2({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);

    const [terminalOutput, setTerminalOutput] = useState({ terraform: false, ssh: "" });


    const INIT = {
        softwares: ["django", "apache2", "nginx", "java 17", "mongodb", "tomcat", "docker"],
        ec2: {
            account: "",
            instanceSize: "",
            serverName: "",
            region: "",
            vPC: "",
            subnet: "",
            securityGroupe: "",
            autoPublicIp: true,
            toInstall: "",
            githubLink: "",
            createNewSSHKey: false,
            existentSSHKeyName: "",
            newSSHKeyName: "",
        },
        disabled: {
            region: true,
            vPC: true,
            subnet: true,
            securityGroupe: true,
        },
        django: {
            gitAccount: "",
            port: null,
            github: "",
            launchDockerPostgreSQL: true,
            username: "",
            password: "",
        }
    };

    // EC2 configuration

    const [eC2, setEC2] = useState(INIT.ec2)

    const [django, setDjango] = useState(INIT.django)


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


    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) {
                setToken("expired")
            }
        });

    }, [token, setToken]); // token variation for re-execution


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
                break;
            case "region":
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    vPC: false,
                }));
                getVPCs(token, value, eC2.account, setChooseFrom); //fetch all vPCs inside region from backend
                getSecurityGroups(token, value, eC2.account, setChooseFrom); //fetch all sgs inside region from backend
                getSSHKeys(token, eC2.account, value, setChooseFrom);
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


    const handleDjangoInputChange = (e) => {
        const { name, value } = e.target;
        setDjango((prevConfig) => ({ ...prevConfig, [name]: value }));
    };





    const handleCreateEC2 = async (e) => {
        e.preventDefault();
        setTerminalOutput({ terraform: false, ssh: "" });
        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);

        let SSHKeyIsUnique = !chooseFrom.sSHKeys.includes(newSSHKeyName);  // Same key name at aws will failed, checked here
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
            eC2Configuration.append("token", token); // Token authentication

            const notToBeSent = ["existentSSHKeyName", "newSSHKeyName", "createNewSSHKey"];

            for (const key in eC2) {
                if (eC2.hasOwnProperty(key) && !notToBeSent.includes(key)) {
                    eC2Configuration.append(key, eC2[key]);
                }
            }

            eC2.createNewSSHKey ? eC2Configuration.append("newSSHKeyName", eC2.newSSHKeyName) : eC2Configuration.append("existentSSHKeyName", eC2.existentSSHKeyName);//append here if create or choose

            if (eC2.toInstall == "django") {
                for (const key in django) {
                    eC2Configuration.append(key, django[key]);
                }
            }

            for (let [key, value] of eC2Configuration.entries()) {
                console.log(`${key}: ${value}`);
            }


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/aws/ec2/`,
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

                setTerminalOutput({
                    terraform: data.stdOut,
                    ssh: eC2.createNewSSHKey ?
                        <Downloader key={Math.random()} content={data.privateSSHKey} name={eC2.newSSHKeyName + ".pem"} title={"download private ssh key"} />
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
                                                name.startsWith("aws") &&
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />

                                        <Separation desc="Placement" />

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
                                            Security group
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

                                        <Separation desc="Instance" />
                                        <input
                                            type="checkbox"
                                            onClick={() => {
                                                setEC2((prevConfig) => ({ ...prevConfig, autoPublicIp: !prevConfig.autoPublicIp }))
                                            }}
                                            style={{ accentColor: "black" }} defaultChecked />&nbsp;&nbsp;&nbsp;Auto assign public ipv4 address
                                        <br />
                                        <br />
                                        <select
                                            id="existentSSHKeyName"
                                            name="existentSSHKeyName"
                                            className="form-select w-100 bg-light border-0"
                                            value={eC2.existentSSHKeyName}
                                            onChange={handleInputChange}
                                            disabled={eC2.createNewSSHKey}
                                            required={!eC2.createNewSSHKey}
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
                                                checked={eC2.createNewSSHKey}
                                                onChange={() => { setEC2((prev) => ({ ...prev, createNewSSHKey: !prev.createNewSSHKey })) }}
                                            />
                                            <span className="mx-1">Create new SSH key</span>
                                        </label>

                                        <input
                                            type="text"
                                            id="newSSHKeyName"
                                            name="newSSHKeyName"
                                            value={eC2.newSSHKeyName}
                                            placeholder="my_custom_SSH_key_name"
                                            className="form-control mb-2"
                                            onChange={(e) => { setEC2((prev) => ({ ...prev, newSSHKeyName: e.target.value })) }}
                                            required={eC2.createNewSSHKey}
                                            disabled={!eC2.createNewSSHKey}
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
                                        <Separation desc="Pre-configuration" title="New SSH key, opened port 22 and a public IP Address are required" />

                                        {eC2.createNewSSHKey && eC2.autoPublicIp && (
                                            <>
                                                <label className="form-label">Deployment Technology</label>
                                                <select
                                                    id="toInstall"
                                                    name="toInstall"
                                                    className="form-select w-100 bg-light border-0"
                                                    value={eC2.toInstall}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="" disabled>choose a software to install</option>
                                                    <option value="nothing">don&apos;t install anything</option>
                                                    {INIT.softwares.map((software, index) => (
                                                        <option key={index} value={software}>{software}</option>
                                                    ))}
                                                </select>
                                                <br />
                                                <br />

                                                {eC2.toInstall && eC2.toInstall !== "nothing" &&
                                                    <>
                                                        <label className="form-label ">
                                                            github
                                                        </label>
                                                        <select
                                                            type="password"
                                                            value={django.gitAccount}
                                                            name="gitAccount"
                                                            className="form-select w-100 bg-light border-0 mb-3"
                                                            onChange={handleDjangoInputChange}
                                                            required
                                                        > <option value="" defaultValue disabled>choose an existant account</option>
                                                            {chooseFrom.accounts.map(name => (
                                                                name.startsWith("git") &&
                                                                <option key={name} value={name}>{name}</option>
                                                            ))}
                                                        </select>
                                                    </>
                                                }

                                                {eC2.toInstall === "apache2" && (
                                                    <>
                                                        <label className="form-label">GitHub link - Deploy http<i title="must contain an index.html file on the root directory" className="ml-2 bi bi-question-circle-fill cursor-pointer"></i></label>
                                                        <input
                                                            type="text"
                                                            value={eC2.githubLink}
                                                            name="githubLink"
                                                            placeholder="https://www.github.com/johndoe/portfolio"
                                                            className="form-control mb-2"
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </>
                                                )}


                                                {eC2.toInstall === "django" && (
                                                    <>
                                                        <label className="form-label w-100">Application port
                                                            <input
                                                                type="number"
                                                                value={django.port}
                                                                name="port"
                                                                placeholder="8000"
                                                                className="form-control mb-2"
                                                                onChange={handleDjangoInputChange}
                                                                required
                                                            />
                                                        </label>
                                                        <label className="form-label w-100">GitHub link<i title="only API, must contain manage.py  and requirements.txt on the root directory." className="ml-2 bi bi-question-circle-fill cursor-pointer"></i>
                                                            <input
                                                                type="text"
                                                                value={django.github}
                                                                name="github"
                                                                placeholder="https://www.github.com/johndoe/model"
                                                                className="form-control mb-2"
                                                                onChange={handleDjangoInputChange}
                                                                required
                                                            />
                                                        </label>
                                                        <label className="form-label">
                                                            <input
                                                                type="checkbox"
                                                                style={{ accentColor: "black" }}
                                                                checked={django.launchDockerPostgreSQL}
                                                                onChange={() => { setDjango((prev) => ({ ...prev, launchDockerPostgreSQL: !prev.launchDockerPostgreSQL })) }}
                                                            />
                                                            <span className="mx-1">Launch a new PostgreSQL Database in Docker</span>
                                                        </label>
                                                        {django.launchDockerPostgreSQL &&
                                                            <>
                                                                <p className="alert alert-warning" role="alert"><i class="bi bi-exclamation-triangle mr-2"></i>make sure the database configuration matches the given configuration.</p>
                                                                <label className="form-label w-100"> Database username
                                                                    <input
                                                                        type="text"
                                                                        value={django.username}
                                                                        name="username"
                                                                        placeholder="username"
                                                                        className="form-control mb-2 w-100"
                                                                        onChange={handleDjangoInputChange}
                                                                        required
                                                                    />
                                                                </label>
                                                                <label className="form-label w-100"> Database password
                                                                    <input
                                                                        type="password"
                                                                        value={django.password}
                                                                        name="password"
                                                                        placeholder="pa$$w0rd"
                                                                        className="form-control mb-2 w-100"
                                                                        onChange={handleDjangoInputChange}
                                                                        required
                                                                    />
                                                                </label>

                                                                <div className="row">
                                                                    <div className="col">
                                                                        <label className="form-label" htmlFor="fname">
                                                                            Database name
                                                                        </label>
                                                                        <input
                                                                            className="form-control"
                                                                            onChange={handleInputChange}
                                                                            value="postgres"
                                                                            disabled
                                                                        />
                                                                    </div>
                                                                    <div className="col">
                                                                        <label className="form-label" htmlFor="lname">
                                                                            Database port
                                                                        </label>
                                                                        <input
                                                                            className="form-control"
                                                                            onChange={handleInputChange}
                                                                            value="5432"
                                                                            disabled
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="w-100">
                                                                    <label className="form-label" htmlFor="lname">
                                                                        Database Address
                                                                    </label>
                                                                    <input
                                                                        className="form-control"
                                                                        onChange={handleInputChange}
                                                                        value="127.0.0.1 / localhost"
                                                                        disabled
                                                                    />
                                                                </div>
                                                            </>
                                                        }



                                                    </>
                                                )}








                                                <p className="mt-3 alert alert-warning" role="alert"><i class="bi bi-exclamation-triangle mr-2"></i>make sure that the subnet is public, and that the ports you need are open including SSH (22).</p>
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



