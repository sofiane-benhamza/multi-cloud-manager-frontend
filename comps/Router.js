import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';

function Router({ currentPath }) {
    const router = useRouter();
    const [pathSegments, setPathSegments] = useState([]);

    // Define the dictionary object
    const dictionary = {
        "home": "Home",
        "profile": "Profile",
        "credentials": "Credentials",
        "personal": "Personal",
        "ssh_keys": "SSH Keys",

        "aws": "AWS",
        "ec2": "EC2",
        "create": "Create",
        "vpc": "VPC",
        "s3": "S3",
        "rds": "RDS",
        "ecs": "ECS",
        "amplify": "Amplify",
        "sgs": "Security Groups",
        "route 53": "Route 53",

        "azure": "Azure",
        "vm": "Virtual Machines",
        "vn": "Virtual Networks",
        "rg": "Resource Groups",
        "sql": "SQL Database",
        "subnet": "Create a Subnet",
        "static_web_app": "Static Web App",

        "gcp": "GCP",
        "mysql": "MySQL",
        "postgres": "PostgreSQL",
        "ce": "Compute Engine",
        "storage": "Storage",

        "github_actions": "Github Actions",
        "azure_static_web_app": "Deploy a Static Web App"
        // Add more translations as needed
    };

    // Function to translate a word
    function fullName(word) {
        if (dictionary.hasOwnProperty(word)) {
            return dictionary[word];
        } else {
            return word;
        }
    }



    useEffect(() => {
        const trimmedPath = currentPath.replace(/^\/|\/$/g, ''); // Remove leading and trailing '/'
        const segments = trimmedPath.split('/');
        setPathSegments(segments);
    }, [currentPath]);

    const setRoute = (index) => {
        const newPath = '/' + pathSegments.slice(0, index + 1).join('/');
        router.push(newPath);
    }

    return (
        <div className="border border-dark rounded mt-2 py-2 text-light tilt-warp-title h6" style={{ width: "90%", marginLeft: "5%", background: "black" }}>
            <i className="ml-3 bi bi-router-fill"></i>
            {pathSegments.map((segment, index) => (
                <React.Fragment key={index}>
                    <span className="mx-3" onClick={() => setRoute(index)} style={{ cursor: 'pointer' }}>{fullName(segment)}</span>&nbsp;
                    {index !== pathSegments.length - 1 && <span className="ml-1">{<i className="bi bi-caret-right-fill" />}</span>}
                </React.Fragment>
            ))}
        </div>
    );
}

export default Router;
