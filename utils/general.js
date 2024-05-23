async function getCredentials(token, setChooseFrom, getFullCredentials) {
    if (!token || token == "expired")
        return false
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}cloud/?token=${token}`,
            {
                method: "GET",
            }
        );

        if (response.ok) {
            const data = await response.json();

            if (data.message) return true  // the case where there is no  credentials yet

            if (getFullCredentials) {
                let awsAccounts = [{}], azureAccounts = [{}], gitAccounts = [{}];

                if (data.aws.length > 0) {
                    awsAccounts = data.aws.map(item => ({
                        id: item.account,
                        accessKeyId: item.accessKeyId,
                        secretAccessKey: item.secretAccessKey,
                    }));
                }

                if (data.azure.length > 0) {
                    azureAccounts = data.azure.map(item => ({
                        id: item.account,
                        subscriptionId: item.subscriptionId,
                        clientId: item.clientId,
                        clientSecret: item.clientSecret,
                        tenantId: item.tenantId
                    }));
                }

                if (data.git.length > 0) {
                    gitAccounts = data.git.map(item => ({
                        id: item.account,
                        gitToken: item.gitToken
                    }));
                }
                console.warn(awsAccounts, azureAccounts, gitAccounts)
                setChooseFrom((prev) => ({ ...prev, "aws": awsAccounts, "azure": azureAccounts, "git": gitAccounts }));
            } else { // Only IDs
                const awsAccounts = data.aws.map(item => item.account);
                const azureAccounts = data.azure.map(item => item.account);
                const githubAccounts = data.git.map(item => item.account);
                const accounts = [...awsAccounts, ...azureAccounts, ...githubAccounts];
                setChooseFrom((prevState) => ({
                    ...prevState,
                    accounts: accounts,
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

// Returns True if token are good, False otherwise
async function getPersonnalInfo(token, setPersonnalInfo, getNameOnly) {
    if (!token || token == "expired")
        return false

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDR}users/?token=${token}`,
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
}

// Static functions

function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function valideGithubRepository(url) {
    const Regex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)(?:\/)?$/;
    return Regex.test(url);
}

function validateIPAddress(ipAddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) {
        return (true)
    }
    return (false)
}

function Separation({ desc, title }) {
    return (
        <>
            <div className="d-flex my-3 w-100  flex-row justify-content-between align-items-center">
                <hr className="w-25 border border-dark" />
                <p className="h6 text-center"> {desc} </p>
                {title && <i title={title} className="mx-2 bi bi-question-circle-fill cursor-pointer"></i>}
                <hr className="w-25 border border-dark" />
            </div>
        </>

    )
}


const wait = <div className="spinner-border text-primary" role="status">   <span className="sr-only"></span> </div>

export { getCredentials, getPersonnalInfo, validateIPAddress, Separation, valideGithubRepository, validateEmail, wait };
