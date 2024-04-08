import Link from 'next/link';
import { Navbar, Nav } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default function Header({ isConnected, token }) {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const getName = async () => {
            if (!token) {
                return;
            }

            try {
                const response = await fetch(
                    `http://${process.env.NEXT_PUBLIC_BACKEND_IP_ADDR}:8000/users?token=${token}`,
                    {
                        method: "GET",
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setUserName(data.fname);
                } else {
                    const errorData = await response.json();
                    console.error("Authentication failed:", errorData.error);
                }
            } catch (error) {
                console.error("Error during authentication:", error.message);
            } 
        };

        getName();
    }, [token]);
    return (isConnected ?
        <Navbar collapseOnSelect expand="lg" variant="dark" className="text-light" style={{backgroundColor:"black"}}>
            <Navbar.Brand>
                <Link href="/home" passHref legacyBehavior>
                    <a className="title fw-bolder m-2 p-2 headerChild martian-mono-head">
                        Matious
                    </a>
                </Link>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
                <Nav className="ml-auto">
                    <Link href="/profile" passHref legacyBehavior>
                        <Nav.Link className="fw-bold m-2 p-2 headerChild text-light ">
                            <i className="bi bi-person-circle"></i>&nbsp;&nbsp;{userName}</Nav.Link>
                    </Link>
                    <Link href="/login?code=48593215" passHref legacyBehavior>
                        <Nav.Link className="fw-bold m-2 p-2 headerChild text-light ">
                            <i className="bi bi-box-arrow-right"></i>&nbsp;&nbsp;Disconnect</Nav.Link>
                    </Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar> :
        <Navbar collapseOnSelect expand="lg" variant="dark" className="text-light" style={{backgroundColor:"black"}}>
            <Navbar.Brand>
                <Link href="/" passHref legacyBehavior>
                    <a className="title fw-bolder m-2 p-2 headerChild martian-mono-head">
                        Matious
                    </a>
                </Link>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
                <Nav className="ml-auto">
                    <Link href="/login" passHref legacyBehavior>
                        <Nav.Link className="fw-bold m-2 p-2 headerChild text-light ">
                            <i className="bi bi-box-arrow-in-right"></i>&nbsp;&nbsp;Connect</Nav.Link>
                    </Link>
                    <Link href="/signup" passHref legacyBehavior>
                        <Nav.Link className="fw-bold m-2 p-2 headerChild text-light ">
                            <i className="bi bi-person-plus"></i>&nbsp;&nbsp;Join us
                        </Nav.Link>
                    </Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
