import Link from 'next/link';
import { Navbar, Nav } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/pages/_app';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Header({ disconnect, username }) {
    const router = useRouter();
    const { isLoggedIn } = useContext(AuthContext);

    const [isNotAtTop, setIsNotAtTop] = useState(false);

    useEffect(() => {
        function handleScroll() {
            setIsNotAtTop(window.scrollY > 0);
        }

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            <Navbar collapseOnSelect expand="lg" variant="dark" className="text-light tilt-warp-title h6 position-fixed w-100 bg-black" style={{ height: "80px", zIndex: "10", opacity: isNotAtTop ? 0.8 : 1 }}>
                <Link href={isLoggedIn ? "/home" : "/"} passHref legacyBehavior>
                    <Navbar.Brand>
                        <Image
                            style={{ filter: "drop-shadow(0px 0px 1px #FFF)" }}
                            src="/assets/images/logo.png"
                            alt="Cloud logo"
                            width={100}
                            height={60}
                            fetchpriority={"high"} // Changed fetchPriority to fetchpriority
                        />
                    </Navbar.Brand>
                </Link>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end bg-black">
                    <Nav className="ml-auto">
                        <Link href={isLoggedIn ? "/profile" : "/login"} passHref legacyBehavior>
                            <Nav.Link className="m-2 p-2 custom-dark-button">
                                {isLoggedIn ? (
                                    <><i className="bi bi-person-circle"></i>&nbsp;&nbsp;{username ? username : "user"}</>
                                ) : (
                                    <><i className="bi bi-box-arrow-in-right mr-1"></i>&nbsp;&nbsp;Connect</>
                                )}
                            </Nav.Link>
                        </Link>
                        {isLoggedIn ? (
                            <Nav.Link className="m-2 p-2 custom-dark-button" onClick={() => { disconnect() }}>
                                <i className="bi bi-box-arrow-right"></i>&nbsp;&nbsp;Disconnect
                            </Nav.Link>
                        ) : (
                            <Link href="/signup" passHref legacyBehavior>
                                <Nav.Link className="fw-bold m-2 p-2 custom-dark-button">
                                    <i className="bi bi-person-plus"></i>&nbsp;&nbsp;Join us
                                </Nav.Link>
                            </Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <div style={{ height: "80px" }}></div>
        </>
    );
}
