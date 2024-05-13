async function getVMs(token, account, region, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/vms/?` + new URLSearchParams({
                token: token,
                account: account,
                region: region
            }), {
            method: 'GET'
        });

        if (response.ok) {
            let data = await response.json();
            console.log(data)
            if (data.length == 0)
                data = [{ resourceGroup: "there is no virtual machines", name: "-", size: "-", status: "-", privateIp: "-", publicIp: "-" }]
            setResult((prevState) => ({
                ...prevState,
                vms: data,
            }))
            return true
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
};

async function getResourceGroups(token, account, region, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/resource_groups/?` + new URLSearchParams({
                token: token,
                account: account,
                region: region
            }), {
            method: 'GET'
        });

        if (response.ok) {
            let data = await response.json();
            if (data.length == 0)
                data = ["there is no resource groups"]
            setResult((prevState) => ({
                ...prevState,
                resourceGroups: data,
            }))
            return true
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
};

async function getVNs(token, account, region, resourceGroup, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/vns/?` + new URLSearchParams({
                token: token,
                account: account,
                region: region,
                resourceGroup: resourceGroup,
            }), {
            method: 'GET'
        });

        if (response.ok) {
            let data = await response.json();
            console.log(data)
            if (data.length == 0)
                data = [{ name: "there is no virtual networks", mask: "-", cidrBlock: "-" }]
            setResult((prevState) => ({
                ...prevState,
                vns: data,
            }))
            return true
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
};

async function getSubnets(token, account, virtualNetworkName, resourceGroup, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/subnets/?` + new URLSearchParams({
                token: token,
                account: account,
                virtualNetworkName: virtualNetworkName,
                resourceGroup: resourceGroup
            }), {
            method: 'GET'
        });
        if (response.ok) {
            let data = await response.json();
            console.log(data)
            if (data.length == 0)
                data = [{ name: "there is no subnets", cidrBlock: "-" }]
            setResult((prevState) => ({
                ...prevState,
                subnets: data,
            }))
            return true
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
}

async function getSecurityGroups(token, account, resourceGroup, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/security_groups/?` + new URLSearchParams({
                token: token,
                account: account,
                resourceGroup: resourceGroup
            }), {
            method: 'GET'
        });

        if (response.ok) {
            let data = await response.json();
            if (data.length == 0)
                data = [{ name: "there is no security groups", id: "-" }]
            setResult((prevState) => ({
                ...prevState,
                securityGroups: data,
            }))
            return true
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
}

async function getSSHKeys(token, account, resourceGroup, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}azure/ssh_keys/?` + new URLSearchParams({
                token: token,
                account: account,
                resourceGroup: resourceGroup
            }), {
            method: 'GET'
        });

        if (response.ok) {
            let data = await response.json();
            if (data.length == 0)
                data = ["there is no SSH Keys"]
            setResult((prevState) => ({
                ...prevState,
                sshKeys: data,
            }))
            return true
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
}






const locations = [
    "eastus",
    "eastus2",
    "westus",
    "westus2",
    "centralus",
    "northcentralus",
    "southcentralus",
    "westcentralus",
    "canadacentral",
    "canadaeast",
    "brazilsouth",
    "brazilsoutheast",
    "northeurope",
    "westeurope",
    "uksouth",
    "ukwest",
    "francecentral",
    "francesouth",
    "germanynorth",
    "germanywestcentral",
    "germanycentral",
    "norwayeast",
    "norwaywest",
    "switzerlandnorth",
    "switzerlandwest",
    "uaenorth",
    "uaecentral",
    "southafricanorth",
    "southafricawest",

];

const sizes = [
    "Standard_A0",
    "Standard_A1",
    "Standard_A2",
    "Standard_A3",
    "Standard_A4",
    "Standard_A5",
    "Standard_A6",
    "Standard_A7",
    "Standard_A8",
    "Standard_A9",
    "Standard_A10",
    "Standard_A11",
    "Standard_B1ls",
    "Standard_B1s",
    "Standard_B2s",
    "Standard_B4ms",
    "Standard_B8ms",
    "Standard_D1",
    "Standard_D2",
    "Standard_D3",
    "Standard_D4",
    "Standard_D5",
    "Standard_D11",
    "Standard_D12",
    "Standard_D13",
    "Standard_D14",
    "Standard_D15_v2",
    "Standard_DS1",
    "Standard_DS2",
    "Standard_DS3",
    "Standard_DS4",
    "Standard_DS5_v2",
    "Standard_DS11",
    "Standard_DS12",
    "Standard_DS13",
    "Standard_DS14"
]


export { locations, sizes, getVMs, getResourceGroups, getVNs, getSubnets, getSecurityGroups, getSSHKeys }