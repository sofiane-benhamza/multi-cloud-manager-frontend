import Link from 'next/link';
import { Navbar, Nav } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import { FullContext } from '../pages/_app';
import { useRouter } from 'next/router';
import { handleDisconnect, getPersonnalInfo } from '../utils/functions';

export default function Header({ setToken, setWarning }) {
    const [user, setUser] = useState({ fname: "" });
    const router = useRouter();

    const { token } = useContext(FullContext)

    const handleDisconnectCaller = () => {
        setToken(null);
        if (typeof window !== 'undefined' && localStorage) { // Check for window and localStorage availability
            localStorage.removeItem('token');
        } else {
            console.warn("local storage is not available ... header")
        }
        setUser({fname:""});
        handleDisconnect(token);
        setWarning({
            message:"See you soon.",
            type:"success",
            isShown:true
        })
        router.push("/");
    }
    // Get user name when ready,  token are read / generated
    useEffect(() => {
        token && getPersonnalInfo(token, setUser, true); //this is a async function
    }, [token]);

    var isLoggedIn = (user.fname != "");

    return (
        <>
            <Navbar collapseOnSelect expand="lg" variant="dark" className="text-light tilt-warp-title h5" style={{ backgroundColor: "black" }}>
                <Link href={isLoggedIn ? "/home" : "/"} passHref legacyBehavior>
                    <Navbar.Brand>
                        <p className="m-2 p-2 h3">
                            Matious
                        </p>
                    </Navbar.Brand>
                </Link>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
                    <Nav className="ml-auto">
                        <Link href={isLoggedIn ? "/profile" : "/login"} passHref legacyBehavior>
                            <Nav.Link className="m-2 p-2 custom-dark-button">
                                {isLoggedIn ?
                                    (<><i className="bi bi-person-circle"></i>&nbsp;&nbsp;{user.fname}</>) :
                                    (<><i className="bi bi-box-arrow-in-right mr-1"></i>&nbsp;&nbsp;Connect</>)
                                }
                            </Nav.Link>
                        </Link>
                        {isLoggedIn ? (
                            <div onClick={() => {
                                handleDisconnectCaller()
                            }}>
                                <Nav.Link className="m-2 p-2 custom-dark-button">
                                    <i className="bi bi-box-arrow-right"></i>&nbsp;&nbsp;Disconnect
                                </Nav.Link>
                            </div>
                        ) : (
                            <Link href="/signup" passHref legacyBehavior>
                                <Nav.Link className="fw-bold m-2 p-2  custom-dark-button">
                                    <i className="bi bi-person-plus"></i>&nbsp;&nbsp;Join us
                                </Nav.Link>
                            </Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </>
    );
}
