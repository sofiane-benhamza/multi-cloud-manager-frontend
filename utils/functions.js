async function getCredentials(token, setChooseFrom, getFullCredentials) {
    if (!token)
        return false
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/cloud/?token=" + token,
            {
                method: "GET",
            }
        );

        if (response.ok) {
            const data = await response.json();

            if (data.message) return true ///the case where there is credentials yet

            if (getFullCredentials) {
                const accounts = data.map(item => ({
                    id: item.uniqueName,
                    accessKeyId: item.accessKeyId,
                    secretAccessKey: item.secretAccessKey,
                    cloud: item.cloud
                }));
                setChooseFrom(accounts);
            } else { // Only IDs
                const names = data.map(item => item.uniqueName);
                setChooseFrom((prevState) => ({
                    ...prevState,
                    accounts: names,
                }))
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error("something went wrong ", error);
        return true
    }
}   // would you like to set up an account

async function getVPCs(token, region, account, setChooseFrom) {
    if (!token)
        return false
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/vpc/?" +
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
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/subnet/?" +
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
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/security_group/?token=" + token + "&region=" + region + "&uniqueName=" + account,
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
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/ssh_keys/?" +
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
                subnets: data
            }))
            return true;
        }
        return false
    } catch (error) {
        console.error("something went wrong");
        return false
    }
}

// Returns True if token are good, False otherwise
async function getPersonnalInfo(token, setPersonnalInfo, getNameOnly) {
    if (!token)
        return false

    try {
        const response = await fetch(
            `http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/users/?token=${token}`,
            {
                method: "GET",
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (getNameOnly) {
                data && setPersonnalInfo(data.fname);
            } else {
                data && setPersonnalInfo({
                    fname: data.fname,
                    lname: data.lname,
                    email: data.email,
                    role: data.role
                });
            }
            return true;
        }

        return false

    } catch (error) {
        console.error("something went wrong")
        return false
    }
};

async function getEC2s(token, account, region, setResult) {
    if (!token)
        return false
    try {
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/aws/ec2/?` + new URLSearchParams({
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
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/aws/ecs/?` + new URLSearchParams({
            token: token,
            uniqueName: account,
            region: region
        }), {
            method: 'GET'
        });
        if (response.ok) {
            let data = await response.json();
            if (data.length == 0)
                data = [{ name: "there is no clusters", tasks:[],  services: [], containerInstances: [] }]
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
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/aws/s3/?` + new URLSearchParams({
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
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/aws/rds/?` + new URLSearchParams({
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

// Static functions

function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function validateIPAddress(ipAddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) {
        return (true)
    }
    return (false)
}

function separation(title) {
    return (
        <>
            <div className="d-flex my-3 flex-row align-items-center">
                <hr className="w-25 border border-dark" />
                <p className="h6 flex-grow-1 text-center"> {title} </p>
                <hr className="w-25 border border-dark" />
            </div>
        </>

    )
}

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

const wait = <div className="spinner-border text-primary" role="status">   <span className="sr-only"></span> </div>

export { getEC2s, getECSs, getRDSs, getS3s, getCredentials, getVPCs, getSubnets, getSecurityGroups, getSSHKeys, getPersonnalInfo, validateIPAddress, validateEmail, separation, sizes, regions, wait };

