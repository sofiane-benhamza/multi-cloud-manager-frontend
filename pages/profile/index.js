import { useRouter } from "next/router";
import ProfileNavbar from '@/comps/ProfileNavbar.js'; // Importing the profile component
import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../_app";

export default function Profile() {
    const { token } = useContext(AuthContext);
    const [fact, setFact] = useState("")

    const getFact = useCallback(async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cloud/facts/?token=${token}`,
                {
                    method: "GET",
                }
            );

            if (response.ok) {
                const data = await response.json();
                setFact(data.fact);
            } else {
                console.error("Failed to fetch data");
            }
        } catch (error) {
            console.error("Something went wrong:", error);
        }
    }, [token]);

    useEffect(() => {
        getFact();
    }, [token, getFact]);


    return (
        <>
            <ProfileNavbar />
            <div className="w-100 border border-dark rounded my-4 p-5 container  tilt-warp-title">
                <h4>did you know ?</h4>
                <h5>     {fact ? fact : "That we do  not have a useful information for you currently."}</h5>

            </div>
        </>
    )
} 