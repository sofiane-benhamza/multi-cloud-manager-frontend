import { useRouter } from "next/router";
import Link from 'next/link';
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import { Navbar, Nav } from 'react-bootstrap';
import { useEffect } from "react";

export default function ProfileNavbar({ token }) {
    const router = useRouter();


    return (
        <>
            <div className="border border-dark rounded mb-4 mt-2" style={{ width: "90%", marginLeft: "5%" }}>
                <Navbar collapseOnSelect expand="lg" variant="dark" className="text-dark">
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" className="ml-auto" style={{ padding: '0.5rem' }} />
                    <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
                        <Nav className="ml-auto" >
                            <Link href="/profile/providers" className="ml-auto bg-primary " passHref legacyBehavior>
                                <Nav.Link className="fw-bold text-dark text-decoration-none d-flex align-items-center">
                                    <div><i className="bi bi-cloud mx-3"></i>cloud providers</div>
                                </Nav.Link>
                            </Link>
                            <Link href="/profile/credentials" passHref legacyBehavior>
                                <Nav.Link className="fw-bold text-dark text-decoration-none d-flex align-items-center">
                                    <div><i className="bi bi-key-fill mx-3"></i>credentiels</div>

                                </Nav.Link>
                            </Link>
                            <Link href="/profile/personal" passHref legacyBehavior>
                                <Nav.Link className="fw-bold text-dark text-decoration-none d-flex align-items-center">
                                    <div><i className="bi bi-person mx-3"></i>informations</div>

                                </Nav.Link>
                            </Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        </>
    )
}