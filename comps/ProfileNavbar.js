import { useRouter } from "next/router";
import Link from 'next/link';
import { Navbar, Nav } from 'react-bootstrap';

export default function ProfileNavbar({ token }) {
    const router = useRouter();
    return (
        <>
            <div className="border border-dark rounded mb-4" style={{ width: "90%", marginLeft: "5%", background: "black" }}>
                <Navbar collapseOnSelect expand="lg" variant="dark">
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" className="ml-auto" style={{ padding: '0.5rem' }} />
                    <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
                        <Nav className="ml-auto baloo-da-beautiful font-weight-bold h6" >
                            <Link href="/profile/ssh_keys" passHref legacyBehavior>
                                <Nav.Link className="mx-1 d-flex align-items-center custom-dark-button">
                                    <div><i className="bi bi-key mx-3" />SSH Keys</div>

                                </Nav.Link>
                            </Link>
                            <Link href="/profile/credentials" passHref legacyBehavior>
                                <Nav.Link className="mx-1  d-flex align-items-center custom-dark-button">
                                    <div><i class="bi bi-fingerprint mx-3"></i>credentiels</div>

                                </Nav.Link>
                            </Link>
                            <Link href="/profile/personal" passHref legacyBehavior>
                                <Nav.Link className="mx-1 d-flex align-items-center custom-dark-button">
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