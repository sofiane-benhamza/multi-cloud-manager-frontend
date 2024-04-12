import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';

function Router({ currentPath }) {
    const router = useRouter();
    const [pathSegments, setPathSegments] = useState([]);

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
        <div className="border border-dark rounded mt-2 py-2 text-light tilt-warp-title h5" style={{ width: "90%", marginLeft: "5%", background: "black" }}>
            <i class="ml-3 bi bi-router-fill"></i>
            {pathSegments.map((segment, index) => (
                <React.Fragment key={index}>
                    <span className="mx-4" onClick={() => setRoute(index)} style={{ cursor: 'pointer' }}>{segment}</span>
                    {index !== pathSegments.length - 1 && <span className="mx-2">{<i class="bi bi-caret-right-fill" />}</span>}
                </React.Fragment>
            ))}
        </div>
    );
}

export default Router;
