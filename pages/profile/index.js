import { useRouter } from "next/router";
import Link from 'next/link';
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import { Navbar, Nav } from 'react-bootstrap';
import { useEffect } from "react";
import ProfileNavbar from '../../comps/ProfileNavbar.js'; // Importing the profile component


export default function controller() {
    const router = useRouter();

    return (
        <>
            <ProfileNavbar />
        </>
    )
}