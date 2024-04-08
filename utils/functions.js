
export async function getCredentials(token, setChooseFrom) {
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/cloud/?token=" + token,
            {
                method: "GET",
            }
        );
        const data = await response.json();
        const names = data.map(item => item.uniqueName);
        setChooseFrom((prevState) => ({
            ...prevState,
            accounts: names,
        }))
    } catch (error) {
        alert("something went wrong .. 127", error)
    }
}

export async function getVPCs(token, region, account, setChooseFrom) {
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/vpc/?token=" + token + "&region=" + region + "&uniqueName=" + account,
            {
                method: "GET",
            }
        );
        if (!response.ok) {
            alert("something went wrong ... 903")
        }
        const data = await response.json();

        setChooseFrom((prevState) => ({
            ...prevState,
            vPCs: data
        }));
    } catch (error) {
        alert("something went wrong ... 982")
    }
}

export async function getSubnets(token, region, account, vpc, setChooseFrom) {
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/subnet/?token=" + token + "&region=" + region + "&uniqueName=" + account + "&vpc=" + vpc,
            {
                method: "GET",
            }
        );
        if (!response.ok) {
            alert("something went wrong ... 903")
        }
        const data = await response.json();

        setChooseFrom((prevState) => ({
            ...prevState,
            subnets: data
        }))
    } catch (error) {
        alert("something went wrong ... 983")
    }
}

export async function getSecurityGroups(token, region, account, setChooseFrom) {
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/security_groupe/?token=" + token + "&region=" + region + "&uniqueName=" + account,
            {
                method: "GET",
            }
        );
        if (!response.ok) {
            alert("something went wrong ... 903");
        }
        const data = await response.json();

        setChooseFrom((prevState) => ({
            ...prevState,
            securityGroups: data
        }));
    } catch (error) {
        alert("something went wrong");
    }
}

export async function getSSHKeys(token, account, setChooseFrom) {
    try {
        const response = await fetch(
            "http://" + process.env.NEXT_PUBLIC_BACKEND_IP_ADDR + ":8000/aws/ssh_keys/?token=" + token + "&uniqueName=" + account,
            {
                method: "GET",
            }
        );
        if (!response.ok) {
            alert("something went wrong ... 909");
        }
        const data = await response.json();

        setChooseFrom((prevState) => ({
            ...prevState,
            sSHKeys: data
        }));
    } catch (error) {
        alert("something went wrong ... 918");
    }
}

export const getPersonnalInfo = async (token, setPersonnalInfo) => {
    // Get user information
    try {
        const formData = new FormData();
        formData.append("token", token);

        const response = await fetch(
            `http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/users/?token=${token}`,
            {
                method: "GET",
            }
        );
        const data = await response.json();
        data && setPersonnalInfo({
            fname: data.fname,
            lname: data.lname,
            email: data.email,
            role: data.role
        });

    } catch (error) {
        console.error("something went wrong ... 273");
    }
};

export const validateIPAddress = (ipAddress) => {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) {
        return (true)
    }
    return (false)
}

export function separation(title) {
    return (
        <div className="row" >
            <hr className="w-25 border border-dark" />
            <span className="h5"> {title} </span>
            <hr className="w-25 border border-dark" />
        </div>
    )
}

export const sizes = [
    "t1.micro", "t2.micro", "t2.small", "t2.medium", "t2.large",
    "m5.large", "m5.xlarge", "m5.2xlarge", "m5.4xlarge", "m5.8xlarge", "m5.12xlarge", "m5.16xlarge",
    "c5.large", "c5.xlarge", "c5.2xlarge", "c5.4xlarge", "c5.9xlarge", "c5.18xlarge",
    "r5.large", "r5.xlarge", "r5.2xlarge", "r5.4xlarge", "r5.8xlarge", "r5.12xlarge", "r5.16xlarge",
    "i3.large", "i3.xlarge", "i3.2xlarge", "i3.4xlarge", "i3.8xlarge", "i3.16xlarge",
    "p3.2xlarge", "p3.8xlarge", "p3.16xlarge",
    "g4dn.xlarge", "g4dn.2xlarge", "g4dn.4xlarge", "g4dn.8xlarge"
];

export const regions = [
    "us-east-1", "us-east-2", "us-east-3", "us-west-1", "us-west-2",
    "ca-central-1",
    "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1"
];

