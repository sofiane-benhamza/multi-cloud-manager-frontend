import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { getVPCs, regions } from "@/utils/aws";
import { getCredentials, Separation } from "@/utils/general";

export default function CreateSecurityGroup({ setWarning, setToken }) {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    const [terminalOutput, setTerminalOutput] = useState("");

    const INIT = {
        sg: {
            account: "",
            region: "",
            vPC: "",
            name: "",
            inbound: [],
            outbound: [],
            allowAllIn: false,
            allowAllOut: false
        },
        disabled: {
            account: false,
            region: true,
            vPC: true,
            securityGroupName: true,
        }
    }
    // SG configuration
    const [securityGroup, setSecurityGroup] = useState(INIT.sg)

    // Disable select buttons, allow when needed
    const [disabled, setDisabled] = useState(INIT.disabled)

    const [createButtonContent, setCreateButtonContent] = useState(<span>Create</span>);

    // Dynamic items to choose from
    const [chooseFrom, setChooseFrom] = useState({
        accounts: [],
        vPCs: [],
    })

    // Call get credentials
    useEffect(() => {
        getCredentials(token, setChooseFrom).then((isOk) => {
            if (!isOk) setToken("expired")
        });;
    }, []);

    // Can not be optimized cause, calling functions time to time
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case "account":
                setSecurityGroupInboundCards([securityGroupCard("in")])
                setSecurityGroupOutboundCards([securityGroupCard("out")])
                setSecurityGroup(INIT.sg)
                setDisabled(INIT.disabled)
                setSecurityGroup(prevConfig => ({
                    ...prevConfig,
                    account: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    region: false
                }));
                break;
            case "region":
                getVPCs(token, value, securityGroup.account, setChooseFrom); //fetch all vPCs inside region from backend
                setSecurityGroup(prevConfig => ({
                    ...prevConfig,
                    region: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    vPC: false
                }));
                break;
            case "name":
                setSecurityGroup(prev => ({
                    ...prev,
                    name: value
                }))
                break;
            case "vPC":
                setSecurityGroup(prevConfig => ({
                    ...prevConfig,
                    vPC: value
                }));
                setDisabled(prevConfig => ({
                    ...prevConfig,
                    subnet: false,
                    securityGroupName: false
                }));
                break;
            case "securityGroupName":
                setSecurityGroup(prevConfig => ({
                    ...prevConfig,
                    name: value
                }))
                break;
            default:
                break;
        }
    };

    const handleCreateSecurityGroup = async (e) => {
        e.preventDefault();
        setCreateButtonContent(
            <span>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait
            </span>
        );

        try {
            const outbound = Object.entries(securityGroupOutboundInfo).map(([key, value]) => ({
                protocol: value.protocol,
                port: value.port,
                destination: value.destination,
                description: value.description
            }));

            // Move the first element from outbound to inbound
            const firstOutboundRule = outbound.shift(); // Remove and get the first element of outbound
            const inbound = [firstOutboundRule, ...Object.entries(securityGroupInboundInfo).map(([key, value]) => ({
                protocol: value.protocol,
                port: value.port,
                destination: value.destination,
                description: value.description
            }))];


            setSecurityGroup(prev => ({
                ...prev,
                inbound: inbound,
                outbound: outbound //some error ,  first element is inbound :(
            }));
            const securityGroupConfig = new FormData();
            securityGroupConfig.append("token", token);

            for (const [key, value] of Object.entries(securityGroup)) {
                if (key == name && value.includes(' ')) {
                    setWarning({
                        message: "security group name must not contain whitespaces !",
                        type: "warning",
                        isShown: true
                    });
                } else if (key != "inbound" && key != "outbound") {
                    securityGroupConfig.append(key, value);
                }
            }
            // Stringify and append inbound and outbound to FormData
            if (!securityGroup.allowAllIn) {
                securityGroupConfig.append("inbound", JSON.stringify(inbound));
            }

            if (!securityGroup.allowAllOut) {
                securityGroupConfig.append("outbound", JSON.stringify(outbound));
            }


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/aws/security_group/`,
                {
                    method: "POST",
                    body: securityGroupConfig,
                }
            );

            const data = await response.json();
            if (response.ok) {
                setWarning({
                    message: "Security group created successfully",
                    type: "success",
                    isShown: true
                });
                setTerminalOutput(data.stdOut);
            } else {
                setWarning({
                    message: "Something went wrong, please try again later or contact support [error : 399]",
                    type: "warning",
                    isShown: true
                });
                setTerminalOutput(data.stdErr);
            }
        } catch (error) {
            console.error("Something went wrong:", error);
        } finally {
            setCreateButtonContent(<span>Create</span>);
        }
    };


    const [securityGroupInboundInfo, setSecurityGroupInboundInfo] = useState({});
    const [securityGroupOutboundInfo, setSecurityGroupOutboundInfo] = useState({});

    const handleFieldChange = (index, isInbound) => {
        if (isInbound) {
            setSecurityGroupInboundInfo(prev => ({
                ...prev,
                [index]: {
                    protocol: document.getElementById(`protocol-${index}`).value,
                    port: document.getElementById(`port-${index}`).value,
                    destination: document.getElementById(`source-${index}`).value,
                    description: document.getElementById(`desc-${index}`).value
                }
            }));
        } else {
            setSecurityGroupOutboundInfo(prev => ({
                ...prev,
                [index]: {
                    protocol: document.getElementById(`protocol-${index}`).value,
                    port: document.getElementById(`port-${index}`).value,
                    destination: document.getElementById(`source-${index}`).value,
                    description: document.getElementById(`desc-${index}`).value
                }
            }));
        }
    };



    const securityGroupCard = (index, isInbound) => {
        let isNotFirstCard = (index !== "in" && index !== "out");
        return (
            <div className="d-flex flex-row w-100 align-items-center" key={index}>
                <select id={`protocol-${index}`} className="form-select bg-light w-100 h-100 col-2 border-0 py-3" onChange={() => handleFieldChange(index, isInbound)}>
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                </select>
                <input type="number" id={`port-${index}`} className="form-control col-2" min="0" max="65535" onChange={() => handleFieldChange(index, isInbound)} />
                <select id={`source-${index}`} className="form-select bg-light border-0 col-4 py-3" onChange={() => handleFieldChange(index, isInbound)}>
                    <option value="0">0.0.0.0 / 0</option>
                    <option value="8">0.0.0.0 / 8</option>
                    <option value="16">0.0.0.0 / 16</option>
                    <option value="24">0.0.0.0 / 24</option>
                    <option value="32">0.0.0.0 / 32</option>
                </select>
                <input type="text" id={`desc-${index}`} className="form-control col-3" onChange={() => handleFieldChange(index, isInbound)} />
                {isNotFirstCard && <button type="button"
                    className="btn btn-danger col-1 px-2 cursor-pointer"
                    onClick={() => {
                        if (isInbound) {
                            handleRemoveSecurityGroupCard(index, true);
                            setSecurityGroupInboundInfo(prev => {
                                const updatedInfo = { ...prev };
                                delete updatedInfo[index];
                                return updatedInfo;
                            });
                        } else {
                            handleRemoveSecurityGroupCard(index);
                            setSecurityGroupOutboundInfo(prev => {
                                const updatedInfo = { ...prev };
                                delete updatedInfo[index];
                                return updatedInfo;
                            });
                        }
                    }}>
                    <i className="bi bi-trash"></i>
                </button>}
            </div>
        );
    };


    const [securityGroupInboundCards, setSecurityGroupInboundCards] = useState([securityGroupCard("in", true)]);
    const [securityGroupOutboundCards, setSecurityGroupOutboundCards] = useState([securityGroupCard("out", false)]);

    const handleAddSecurityGroupCard = (isInbound) => {
        let index = Math.random().toString(26);
        if (isInbound) {
            setSecurityGroupInboundCards([...securityGroupInboundCards, securityGroupCard(index, true)]);   // Yes, inbound
        } else {
            setSecurityGroupOutboundCards([...securityGroupOutboundCards, securityGroupCard(index, false)]);
        }

        //  setSecurityGroupCards([...securityGroupCards, securityGroupCard(index)]);
    };

    const handleRemoveSecurityGroupCard = (key, isInbound) => {
        if (isInbound) {
            setSecurityGroupInboundCards((prevState) => {
                // Find the index of the card with the specified key
                const index = prevState.findIndex((card) => card.key === key);
                // If the key is not found, return the previous state unchanged
                if (index === -1) {
                    return prevState;
                }
                // Remove the card with the found index
                return prevState.filter((_, i) => i !== index);
            });
        } else {
            setSecurityGroupOutboundCards((prevState) => {
                // Find the index of the card with the specified key
                const index = prevState.findIndex((card) => card.key === key);
                // If the key is not found, return the previous state unchanged
                if (index === -1) {
                    return prevState;
                }
                // Remove the card with the found index
                return prevState.filter((_, i) => i !== index);
            });
        }

    };



    return (
        <div className=" d-flex align-items-center justify-content-center p-5 tilt-warp-title">
            <div className="row d-flex justify-content-center align-items-center col-xl-5 col-lg-6 col-md-7 col-sm-11 col-xs-12">
                <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
                    <div
                        className="bg-transparent text-dark rounded"
                    >
                        <div className="card-body p-md-5 ">
                            <div className="row justify-content-center d-flex justify-content-center align-items-center">
                                <div className="col-12">
                                    <h3 className="text-center h3 mb-3 mx-1 mx-md-4 d-flex flex-row">
                                        Create a Security group
                                        <button
                                            className="btn btn-light btn-lg ml-auto" title="Reset">
                                            <i className="bi bi-trash3-fill cursor-pointer"
                                                onClick={() => {
                                                    setSecurityGroupOutboundCards([securityGroupCard("in", true)])
                                                    setSecurityGroupInboundCards([securityGroupCard("out", false)])
                                                    setSecurityGroup(INIT.sg);
                                                    setDisabled(INIT.disabled);
                                                    setCreateButtonContent(<span>Create</span>)
                                                }}>
                                            </i></button>
                                    </h3>

                                    <form onSubmit={handleCreateSecurityGroup}>
                                        <label className="form-label">
                                            Account
                                        </label>
                                        <select
                                            type="text"
                                            id="account"
                                            name="account"
                                            value={securityGroup.account}
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
                                        <label className="form-label">
                                            Region
                                        </label>
                                        <select
                                            type="text"
                                            id="region"
                                            name="region"
                                            value={securityGroup.region}
                                            disabled={disabled.region}
                                            className="form-select w-100 bg-light border-0"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" defaultValue disabled>Choose an installation Region</option>
                                            {regions.map((region, index) => (
                                                <option key={index} value={region}>{region}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />
                                        <label className="form-label">
                                            Virtual private cloud
                                        </label>
                                        <select
                                            id="vPC"
                                            name="vPC"
                                            className="form-select w-100 bg-light border-0"
                                            value={securityGroup.vPC}
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
                                            Name
                                        </label>

                                        <input type="text"
                                            id="name"
                                            name="name"
                                            value={securityGroup.name}
                                            onChange={handleInputChange}
                                            minLength={6}
                                            maxLength={64}
                                            placeholder="my-dev-securityGroup"
                                            disabled={disabled.securityGroupName}
                                            className="form-select w-100 bg-light border-0"
                                            required
                                        />
                                        <br />
                                        <Separation desc="Inbound rules" />
                                        <div className="d-flex">
                                            <div className="col-2"> protocol </div>
                                            <div className="col-2"> port </div>
                                            <div className="col-4"> source </div>
                                            <div className="col-3"> description </div>
                                            <div className="col-1"> delete </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            style={{ color: "black" }} // Set color for the checkbox itself
                                            checked={securityGroup.allowAllIn}
                                            onChange={() =>
                                                setSecurityGroup((prev) => ({
                                                    ...prev,
                                                    allowAllIn: !prev.allowAllIn,
                                                }))
                                            }
                                        /> &nbsp;&nbsp;&nbsp; Allow all inbound traffic
                                        <br />

                                        {securityGroup.allowAllIn ? null : securityGroupInboundCards}
                                        <div className="text-right d-flex">
                                            <button
                                                title="Add Security group"
                                                type="button"
                                                className="btn btn-primary ml-auto col-1"
                                                onClick={() => { handleAddSecurityGroupCard(true) }}
                                                disabled={disabled.securityGroupName || securityGroup.allowAllIn}
                                            >

                                                <i className="bi bi-plus-circle-fill"></i>
                                            </button>
                                        </div>
                                        <br />
                                        <Separation desc="Outbound rules" />
                                        <input
                                            type="checkbox"
                                            style={{ color: "black" }} // Set color for the checkbox itself
                                            checked={securityGroup.allowAllOut}
                                            onChange={() =>
                                                setSecurityGroup((prev) => ({
                                                    ...prev,
                                                    allowAllOut: !prev.allowAllOut,
                                                }))
                                            }
                                        /> &nbsp;&nbsp;&nbsp; Allow all outbound traffic
                                        {securityGroup.allowAllOut ? null : securityGroupOutboundCards}
                                        <div className="text-right d-flex">
                                            <button
                                                title="Add Security group"
                                                type="button"
                                                className="btn btn-primary ml-auto col-1"
                                                onClick={() => { handleAddSecurityGroupCard(false) }}
                                                disabled={disabled.securityGroupName || securityGroup.allowAllOut}
                                            >
                                                <i className="bi bi-plus-circle-fill"></i>

                                            </button>
                                        </div>

                                        <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-lg"
                                                disabled={!(createButtonContent.type === 'span' && createButtonContent.props.children === 'Create')}
                                            >
                                                {createButtonContent}
                                            </button>
                                        </div>
                                        <input type="checkbox" style={{ accentColor: "black" }} />&nbsp;&nbsp;&nbsp;keep tracking
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
