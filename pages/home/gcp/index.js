import { useRouter } from "next/router";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Link from 'next/link';
import Image from "next/image";

export default function AWS() {
    const router = useRouter();

    const gcpServices = [
        { name: "Compute Engine", link: "ce" },
        { name: "Virtual Private Cloud", link: "vpc", },
        { name: "MySql Database", link: "mysql" },
        { name: "Simple Storage Service", link: "storage" },
        { name: "PostreSQL Database", link: "postgres" },
        { name: "Subnets", link: "subnet"},
        { name: "SQL Database", link: "sql" },
    ]


    return (
        <div className="container">
            <p className="tilt-warp-title text-center my-5 h3 text-dark">Choose Your Service</p>
            <div className="d-flex row w-100 justify-content-left mx-auto text-dark">
                {gcpServices.map((service, index) => (
                    <GcpService key={index} name={service.name} link={service.link} />
                ))}

            </div>
        </div>
    )
}


//dynamic cards content
const GcpService = ({ name, link }) => {
    return (
        <Card className="mb-4 overflow-visible col-xl-3 col-lg-4 col-md-6 col-sm-11 col-xs-11 ">
            <div className="p-1 m-1 border border-dark  rounded down-to-up">
                <Link href={`/home/gcp/${link}`} passHref>
                    <CardHeader className="justify-content-between" style={{ height: "100px" }}>
                        <div className="d-flex text-dark font-weight-bold flex-row justify-content-left align-items-center gap-5">
                            <div>
                                <Image className="rounded p-1" width={40} height={35} src="/cloud/gcp/logo.png" alt="service logo" />
                            </div>
                            <div className="ml-2 m-0">
                                <p className="tilt-warp-title h5">{name}</p>
                            </div>

                        </div>
                    </CardHeader>

                    <CardBody className="d-flex justify-content-center">
                        <Image
                            alt="service background"
                            width={300}
                            height={210}
                            src={`/cloud/gcp/${link}.png`}
                        />
                    </CardBody>
                </Link>
            </div>
        </Card>
    );
}