import { useRouter } from "next/router";
import ProfileNavbar from '../../comps/ProfileNavbar.js'; // Importing the profile component


export default function controller() {
    const router = useRouter();

    return (
        <>
            <ProfileNavbar />
        </>
    )
}