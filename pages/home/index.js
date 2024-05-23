import { useRouter } from "next/router";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Link from 'next/link';
import Image from "next/image";

export default function Home() {

    const router = useRouter();

    const cloudProviders = [{ name: "Amazon Web Services", label: "The Leader  of  Cloud  Providers", numberOfServices: "12", link: "aws" },
    { name: "Google Cloud Platform", label: "Master Search Engine Founder", numberOfServices: "5", link: "gcp" },
    { name: "Microsoft Azure", label: "Creator of Microsoft Windows", numberOfServices: "5", link: "azure" },
    { name: "Github actions", label: "Continuous Integration / Delivery", lumberOfServices: "2", link: "github_actions" }
    ]

    return (
        <>
            <p className="tilt-warp-title text-center my-5 h2 text-dark">Chooe Your Provider</p>
            <div className="d-flex flex-wrap w-100 justify-content-center text-dark my-5">
                {cloudProviders.map((cloudProvider, index) =>
                    <CloudProviderCard key={index} name={cloudProvider.name} label={cloudProvider.label} numberOfServices={cloudProvider.numberOfServices} link={cloudProvider.link} />
                )}
            </div>
        </>
    )
}

const CloudProviderCard = ({ name, label, numberOfServices, link }) => {
    return (
        <Card className="py-4 mb-5 border  border-dark mx-5 col-xl-2 col-lg-3 col-md-4 col-sm-11 col-xs-11 down-to-up"
            style={{ width: "306px", maxHeight: "400px" }}>
            <div className="d-flex flex-column justify-content-arround h-100 w-100">
                <Link href={`/home/${link}`} passHref>
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <div className="text-tiny uppercase"> <p className="tilt-warp-title h5">{name}</p></div>
                        <small className=" textsmallcomfortaa-article">{numberOfServices} Managed Services</small>
                        <h4 className="font-bolder text-large"><p className="comfortaa-article h5 my-1 text-dark">{label}</p></h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-1 d-flex justify-content-center">
                        <Image
                            alt="Card background"
                            className="object-cover rounded-xl bg-light rounded"
                            src={`/cloud/${link}.png`}
                            width={270}
                            height={170}
                        />
                    </CardBody>
                </Link>
            </div>
        </Card>
    );
}