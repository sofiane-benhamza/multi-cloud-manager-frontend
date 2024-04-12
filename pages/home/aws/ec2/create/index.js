import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { FullContext } from "../../../../_app";
import { getCredentials, getVPCs, getSubnets, getSecurityGroups, getSSHKeys, sizes, regions, separation } from "../../../../../utils/functions";

export default function CreateEC2({ setWarning, setToken }) {
    const { token } = useContext(FullContext);
    const router = useRouter();

    // EC2 configuration
    const [eC2, setEC2] = useState({
        account: "",
        sSHKeyName: "",
        instanceSize: "",
        serverName: "",
        region: "",
        vPC: "",
        subnet: "",
        securityGroupe: "",
        toInstall: "nothing"
    })
    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState({
        region: true,
        vPC: true,
        subnet: true,
        securityGroupe: true,
    })
    // Disable Create button 
    const eC2ConfigIsComplete = () => {
        return Object.values(eC2).every(val => val !== null && val !== '');
    }

    const [createButtonContent, setCreateButtonContent] = useState(
        <span>Create</span>);


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
        const handleCredentials = async () => {
            const response = await getCredentials(token, setChooseFrom);
        };
        token && handleCredentials(); // Call the function immediately mount

    }, [token]); // token variation for re-execution


    // Can not be optimized cause, calling functions time to time
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case "account":
                setEC2(prevConfig => ({
                    ...prevConfig,
                    account: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    region: false
                }));
                getSSHKeys(token, value, setChooseFrom);
                break;
            case "sSHKeyName":
                setEC2(prevConfig => ({
                    ...prevConfig,
                    sSHKeyName: value
                }));
                break;
            case "instanceSize":
                setEC2(prevConfig => ({
                    ...prevConfig,
                    instanceSize: value
                }));
                break;
            case "serverName":
                setEC2(prevConfig => ({
                    ...prevConfig,
                    serverName: value
                }));
                break;
            case "region":
                setEC2(prevConfig => ({
                    ...prevConfig,
                    region: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    vPC: false,
                    securityGroupe: false
                }));
                getVPCs(token, value, eC2.account, setChooseFrom); //fetch all vPCs inside region from backend
                getSecurityGroups(token, value, eC2.account, setChooseFrom); //fetch all sgs inside region from backend
                break;
            case "toInstall":
                setEC2(prevConfig => ({
                    ...prevConfig,
                    toInstall: value
                }));
                break;
            case "vPC":
                setEC2(prevConfig => ({
                    ...prevConfig,
                    vPC: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    subnet: false
                }));
                getSubnets(token, eC2.region, eC2.account, value, setChooseFrom);
                break;
            case "subnet":
                setEC2(prevConfig => ({
                    ...prevConfig,
                    subnet: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    region: false
                }));
                break;
            case "securityGroupe":
                setEC2(prevConfig => ({
                    ...prevConfig,
                    securityGroupe: value
                }));
                break;
            case "createSSHKeyName":       //new key to be created
                setCreateSSHKeyName(value);
                break;
            default:
                break;
        }
    };

    const handleCreateEC2 = async (e) => {
        e.preventDefault();

        setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);
        if (!eC2ConfigIsComplete) {
            return
        };

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
            if (response.ok) {
                const data = await response.json();
                setWarning({
                    message: "Your EC2 has been created successfully",
                    type: "success",
                    isShown: true
                })
                router.push("./")
            } else {
                setWarning({
                    message: "something went wrong, please try again later or contact support [error : 728]",
                    type: "danger",
                    isShown: true
                })
            }
        } catch (error) {
            alert("something went wrong ... 254 ");
        } finally {
            setCreateButtonContent(<span>Create</span>)
        }

    };

    return (
        <div className=" d-flex align-items-center justify-content-center p-5 tilt-warp-title">
            <div className="row d-flex justify-content-center align-items-center col-xl-4 col-lg-4 col-md-5 col-sm-10 col-xs-12">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
                    <div
                        className="bg-transparent text-dark rounded"
                    >
                        <div className="card-body p-md-5 ">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <form onSubmit={handleCreateEC2}>
                                        <h3 className="text-center h3 mb-2 mx-1 mx-md-4">
                                            create an EC2
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
                                            {chooseFrom.subnets.length > 0 ? chooseFrom.subnets.map(subnet => (
                                                <option key={subnet['Subnet ID']} value={subnet['Subnet ID']} >
                                                    {subnet['Subnet ID']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    {subnet['CIDR Block']}
                                                </option>

                                            )) : <option disabled>there is no Subnets in the current VPC</option>}
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
                                            {chooseFrom.securityGroups.length > 0 ? chooseFrom.securityGroups.map(securityGroup => (
                                                <option key={securityGroup['GroupId']} value={securityGroup['GroupId']} >
                                                    {securityGroup['GroupId']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    {securityGroup['GroupName']}
                                                </option>
                                            )) : <option disabled>there is no Security Groups in the current Region</option>}

                                        </select>
                                        <br />
                                        <br />

                                        {separation("Instance")}
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
                                                <option key={keyName} value={keyName} >
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
                                            <span className="mx-1">Create new SSH key <small className="text-danger">(Erase any key with same name)</small></span>
                                        </label>

                                        <input
                                            type="text"
                                            id="createSSHKeyName"
                                            name="createSSHKeyName"
                                            value={createSSHKeyName}
                                            ref={keyNameRef}
                                            placeholder="my_custom_SSH_key_name"
                                            className="form-control mb-2"
                                            onChange={handleInputChange}
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


                                        <br />
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
                                            <option value="nothing" defaultValue disabled>Choose a software to install</option>
                                            <option value="apache2">Apache2</option>
                                            <option value="java 17" >java 17</option>
                                            <option value="mongodb" disabled>MongoDB</option>
                                        </select>

                                        <br />
                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                            >
                                                {createButtonContent}
                                            </button>
                                        </div>
                                        <input type="checkbox" style={{ accentColor: "black" }} />&nbsp;&nbsp;&nbsp;keep tracking
                                        <br />
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
