
async function getVPCs(token, region, account, setChooseFrom) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/vpc/?` +
            new URLSearchParams({
                token: token,
                region: region,
                uniqueName: account
            }),
            {
                method: "GET",
            }
        );
        if (response.ok) {
            let data = await response.json();
            if (data.length == 0) {
                data = [{
                    "VPC ID": "There is no VPCs",
                    "Name": "-",
                    "CIDR Block": "-/-"
                }]
            }
            setChooseFrom((prevState) => ({
                ...prevState,
                vPCs: data
            }));

            return true
        }
        return false;
    } catch (error) {
        console.error("something went wrong");
        return false;
    }
}

async function getSubnets(token, region, account, setChooseFrom) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/subnet/?` +
            new URLSearchParams({
                token: token,
                region: region,
                uniqueName: account
            }),
            {
                method: "GET",
            }
        );
        if (response.ok) {
            let data = await response.json();
            if (data.length == 0) {
                data = [{
                    "Subnet ID": "there is no Subnets in the current VPC",
                    "VPC ID": "-",
                    "CIDR Block": ""
                }]
            }
            setChooseFrom((prevState) => ({
                ...prevState,
                subnets: data
            }))
            return true;
        }
        return false;
    } catch (error) {
        console.error("something went wrong");
        return false;
    }
}

async function getSecurityGroups(token, region, account, setChooseFrom) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/security_group/?` +
            new URLSearchParams({
                token: token,
                region: region,
                account: account
            }),
            {
                method: "GET",
            }
        );
        if (response.ok) {
            let data = await response.json();
            if (data.length == 0) {
                data = [{
                    groupId: "There is security groups",
                    groupName: "-",
                    vpcId: "-"
                }]
            }
            setChooseFrom((prevState) => ({
                ...prevState,
                securityGroups: data
            }));
            return true
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
}

async function getSSHKeys(token, account, setChooseFrom) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/ssh_keys/?` +
            new URLSearchParams({
                token: token,
                uniqueName: account
            }),
            {
                method: "GET",
            }
        );
        if (response.ok) {
            let data = await response.json();
            if (data.length == 0) {
                data = ["There is no SSH keys"]
            }
            setChooseFrom((prevState) => ({
                ...prevState,
                sSHKeys: data
            }))
            return true;
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
}

async function getEC2s(token, account, region, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/ec2/?` + new URLSearchParams({
                token: token,
                uniqueName: account,
                region: region
            }), {
            method: 'GET'
        });
        if (response.ok) {


            let data = await response.json();
            if (data.length == 0)
                data = [{ id: "there is no instances", name: "-", state: "-", size: "-", privateIp: "-", publicIp: "-" }]
            setResult((prevState) => ({
                ...prevState,
                instances: data,
            }))
            return true
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
};

async function getECSs(token, account, region, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/ecs/?` +
            new URLSearchParams({
                token: token,
                uniqueName: account,
                region: region
            }), {
            method: 'GET'
        });
        if (response.ok) {
            let data = await response.json();
            if (data.length == 0)
                data = [{ clusterName: "there is no clusters", tasks: [], services: [], containerInstances: [] }]
            setResult((prevState) => ({
                ...prevState,
                clusters: data,
            }))
            return true
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
};

async function getS3s(token, region, account, setChooseFrom) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/s3/?` +
            new URLSearchParams({
                token: token,
                uniqueName: account,
                region: region
            }), {
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            let newData = [];
            for (const [key, value] of Object.entries(data)) {
                newData.push({ name: key, storedObjects: value });
            }
            if (newData.length == 0) {
                newData = [{ name: "There is no Buckets", storedObjects: "-" }]
            }
            setChooseFrom((prevState) => ({
                ...prevState,
                s3s: newData,
            }))
            return true
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
}

async function getRDSs(token, account, region, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_ADDR + "aws/rds/?" +
            new URLSearchParams({
                token: token,
                uniqueName: account,
                region: region,
                service: "databases"

            }), {
            method: 'GET'
        });

        if (response.ok) {
            let data = await response.json();
            if (data.length == 0) {
                data = [{ databaseName: "there is no databases", engine: "-", state: "-", totalSize: "-", address: "-", port: "-", takenSize: "-", publicIp: "-" }]
            }
            setResult((prevState) => ({
                ...prevState,
                databases: data,
            }))
            return true
        }
        return false;
    } catch (error) {
        console.error("something went wrong", error);
        return false
    }
};

async function getAmplifyApps(token, account, region, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/amplify/?` +
            new URLSearchParams({
                token: token,
                account: account,
                region: region,

            }), {
            method: 'GET'
        });

        if (response.ok) {
            let data = await response.json();
            if (data.length == 0) {
                data = [{ name: "There is no applications", id: "-", repository: "-", technology: "-" }]
            }
            setResult((prevState) => ({
                ...prevState,
                applications: data,
            }))
            return true
        }
        return false;
    } catch (error) {
        console.error("something went wrong", error);
        return false
    }
};

async function getRoute53Domains(token, account, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/route53/?` +
            new URLSearchParams({
                token: token,
                account: account,
            }), {
            method: 'GET'
        });

        if (response.ok) {
            let data = await response.json();
            if (data.length == 0) {
                console.log("hello")
                data = [{ domain: "There is no registered domains", id: "-", privateZone: "-", recordCount: "-" }]
            }
            setResult((prevState) => ({
                ...prevState,
                domains: data,
            }))
            return true
        }
        return false;
    } catch (error) {
        console.error("something went wrong", error);
        return false
    }
};




const sizes = [
    "t1.micro", "t2.micro", "t2.small", "t2.medium", "t2.large",
    "m5.large", "m5.xlarge", "m5.2xlarge", "m5.4xlarge", "m5.8xlarge", "m5.12xlarge", "m5.16xlarge",
    "c5.large", "c5.xlarge", "c5.2xlarge", "c5.4xlarge", "c5.9xlarge", "c5.18xlarge",
    "r5.large", "r5.xlarge", "r5.2xlarge", "r5.4xlarge", "r5.8xlarge", "r5.12xlarge", "r5.16xlarge",
    "i3.large", "i3.xlarge", "i3.2xlarge", "i3.4xlarge", "i3.8xlarge", "i3.16xlarge",
    "p3.2xlarge", "p3.8xlarge", "p3.16xlarge",
    "g4dn.xlarge", "g4dn.2xlarge", "g4dn.4xlarge", "g4dn.8xlarge"
];

const regions = [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "ca-central-1",
    "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1",
    "sa-east-1"
];



export { getEC2s, getECSs, getRDSs, getS3s, getVPCs, getSubnets, getSecurityGroups, getSSHKeys, getAmplifyApps, getRoute53Domains, sizes, regions };

