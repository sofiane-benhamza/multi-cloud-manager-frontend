async function getCredentials(token, setChooseFrom, getFull) {
    if (!(token && setChooseFrom)) {
        return false;
    }
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/cloud/?token=" + token,
            {
                method: "GET",
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (!getFull) {
                const names = data.map(item => item.uniqueName);
                setChooseFrom((prevState) => ({
                    ...prevState,
                    accounts: names,
                }))
            } else {
                const accounts = data.map(item => ({
                    id: item.uniqueName,
                    accessKeyId: item.accessKeyId,
                    secretAccessKey: item.secretAccessKey,
                    cloud: item.cloud
                }));
                setChooseFrom(accounts);
            }
        } else {
            tokenHasExpired();
        }
    } catch (error) {
        console.error("something went wrong");
    }
}

async function getVPCs(token, region, account, setChooseFrom) {
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/vpc/?token=" + token + "&region=" + region + "&uniqueName=" + account,
            {
                method: "GET",
            }
        );
        if (response.ok) {
            const data = await response.json();
            setChooseFrom((prevState) => ({
                ...prevState,
                vPCs: data
            }));
        }
    } catch (error) {
        console.error("something went wrong")
    }
}

async function getSubnets(token, region, account, vpc, setChooseFrom) {
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/subnet/?token=" + token + "&region=" + region + "&uniqueName=" + account + "&vpc=" + vpc,
            {
                method: "GET",
            }
        );
        if (response.ok) {
            const data = await response.json();

            setChooseFrom((prevState) => ({
                ...prevState,
                subnets: data
            }))
        }
    } catch (error) {
        console.error("something went wrong");
    }
}

async function getSecurityGroups(token, region, account, setChooseFrom) {
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/security_groupe/?token=" + token + "&region=" + region + "&uniqueName=" + account,
            {
                method: "GET",
            }
        );
        if (response.ok) {
            const data = await response.json();
            setChooseFrom((prevState) => ({
                ...prevState,
                securityGroups: data
            }));
        }
    } catch (error) {
        console.error("something went wrong");
    }
}

async function getSSHKeys(token, account, setChooseFrom) {
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/ssh_keys/?token=" + token + "&uniqueName=" + account,
            {
                method: "GET",
            }
        );
        if (response.ok) {
            const data = await response.json();
            setChooseFrom((prevState) => ({
                ...prevState,
                sSHKeys: data
            }));
        }
    } catch (error) {
        console.error("something went wrong");
    }
}

async function getPersonnalInfo(token, setPersonnalInfo, getNameOnly) {
    if (!(token && setPersonnalInfo))
        return false;
    try {
        const formData = new FormData();
        formData.append("token", token);

        const response = await fetch(
            `http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/users/?token=${token}`,
            {
                method: "GET",
            }
        );

        if (!response.ok) {
            console.error("token expired");
            localStorage.removeItem('token');
            return false;
        }
        const data = await response.json();
        if (getNameOnly) {
            data && setPersonnalInfo({
                fname: data.fname
            });
        } else {
            data && setPersonnalInfo({
                fname: data.fname,
                lname: data.lname,
                email: data.email,
                role: data.role
            });
        }
        return true;

    } catch (error) {
        console.error("something went wrong")
    }
};

async function getEC2s(token, account, region, setResult) {
    try {
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/aws/ec2/?token=${token}&uniqueName=${account}&region=${region}`);
        if (!response.ok) throw new Error(`Failed to fetch EC2 instances: ${response.status}`);
        let data = await response.json();
        if (data.length == 0)
            data = [{ name: "there is no instances", id: "-", size: "-", privateIp: "-", publicIp: "-" }]
        setResult((prevState) => ({
            ...prevState,
            instances: data,
        }))
    } catch (error) {
        console.error("something went wrong");
    }
};

async function getS3s(token, region, account, setChooseFrom) {
    try {
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/aws/s3/?token=${token}&uniqueName=${account}&region=${region}`);
        if (!response.ok) throw new Error(`Failed to fetch EC2 instances: ${response.status}`);
        const data = await response.json();
        let newData = [];
        for (const [key, value] of Object.entries(data)) {
            newData.push({ name: key, storedObjects: value });
        }
        setChooseFrom((prevState) => ({
            ...prevState,
            s3s: newData,
        }))
    } catch (error) {
        console.error("something went wrong");
    }
}

async function handleDisconnect(token) {
    try {
        const form = new FormData();
        form.append("token", token);
        form.append("logout", "true");

        const response = await fetch(
            `http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/users/`,
            {
                method: "DELETE",
                body: form,
            }
        );
        if (response.ok) {
            localStorage.removeItem('token');
        }
    } catch (error) {
        console.error("something went wrong");
    }
}
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
    "us-east-1", "us-east-2", "us-east-3", "us-west-1", "us-west-2",
    "ca-central-1",
    "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1"
];

export { getEC2s, getS3s, getCredentials, getVPCs, getSubnets, getSecurityGroups, getSSHKeys, getPersonnalInfo, handleDisconnect, validateIPAddress, validateEmail, separation, sizes, regions };

