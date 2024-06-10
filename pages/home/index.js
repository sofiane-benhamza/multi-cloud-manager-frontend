import { useRouter } from "next/router";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Link from 'next/link';
import Image from "next/image";

export default function Home() {

    const router = useRouter();

    const cloudProviders = [
        { name: "Amazon Web Services", label: "The Leader  of  Cloud  Providers", numberOfServices: "8", link: "aws" },
        { name: "Google Cloud Platform", label: "Master Search Engine Founder", numberOfServices: "7", link: "gcp" },
        { name: "Microsoft Azure", label: "Creator of Microsoft Windows", numberOfServices: "6", link: "azure" },
        { name: "Github actions", label: "Continuous Integration / Delivery", numberOfServices: "1", link: "github_actions" }
    ]

    return (
        <>
            <p className="tilt-warp-title text-center my-5 h2 text-dark">Chooe Your Provider</p>
            <div className="d-flex flex-wrap w-100 container justify-content-left text-dark my-5">
                {cloudProviders.map((cloudProvider, index) =>
                    <CloudProviderCard key={index} name={cloudProvider.name} label={cloudProvider.label} numberOfServices={cloudProvider.numberOfServices} link={cloudProvider.link} />
                )}
            </div>
        </>
    )
}

const CloudProviderCard = ({ name, label, numberOfServices, link }) => {
    return (
        <div className="py-3 mb-5 col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xs-12 mx-auto overflow-hidden"
            style={{ width: "306px", maxHeight: "400px" }}>
            <Link href={`/home/${link}`} passHref>
                <div className="d-flex flex-column justify-content-between h-100 w-100 down-to-up border border-dark">
                    <div className="py-3 px-2 d-flex flex-column">
                        <div className="text-tiny">
                            <p className="tilt-warp-title h5">{name}</p>
                        </div>
                        <small className="textsmallcomfortaa-article text-nowrap">
                            {numberOfServices} Managed Services
                        </small>
                        <h4 className="font-bolder text-large">
                            <p className="comfortaa-article h5 my-1 text-dark">{label}</p>
                        </h4>
                    </div>
                    <div className="p-2 mb-4 mx-auto">
                        <Image
                            alt="Card background"
                            className="object-cover rounded-xl bg-light"
                            src={`/cloud/${link}.png`}
                            width={200}
                            height={120}
                        />
                    </div>
                </div>
            </Link>
        </div>
    );
};
