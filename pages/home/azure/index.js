import { useRouter } from "next/router";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Link from 'next/link';
import Image from "next/image";

export default function azure() {

    const azureServices = [
        { name: "Virtual Machines", link: "vm" },
        { name: "Resource Groups", link: "rg" },
        { name: "Virtual Networks", link: "vn" },
        { name: "Static Web App", link: "static_web_app" },
        { name: "SQL database", link: "sql" },
        { name: "Virtual Subnets", link: "subnet" },
        // { name: "Database for PostgreSQL", link: ""},
        // { name: "Database for MySQL", link: "" },
        // { name: "Azure Cosmos DB", link: "" },


    ]


    return (
        <div className="container">
            <p className="tilt-warp-title text-center my-5 h3 text-dark">Choose Your Service</p>
            <div className="d-flex row w-100 justify-content-left mb-5 text-dark">
                {azureServices.map((service, index) => (
                    <AzureService key={index} name={service.name} link={service.link} />
                ))}

            </div>
        </div>
    )
}


//dynamic cards content
const AzureService = ({ name, link }) => {
    return (
        <Card className="mb-4 overflow-visible col-xl-3 col-lg-4 col-md-6 col-sm-11 col-xs-11 ">
            <div className="p-1 m-1 border border-dark  rounded down-to-up">
                <Link href={`/home/azure/${link}`} passHref>
                    <div className="d-flex flex-column justify-content-between h-100 w-100">
                        <CardHeader className="justify-between">
                            <div className="d-flex text-dark font-weight-bold flex-row justify-content-left align-items-center gap-5">
                                <div>
                                    <Image className="rounded p-1" width={40} height={35} src="/cloud/azure/logo.png" alt="logo" />
                                </div>
                                <div className="ml-3 m-0">
                                    <p className="tilt-warp-title h5">{name}</p>
                                </div>
                                {link && <button title="done" className="btn btn-success btn-lg ml-auto"><i className="bi bi-check-circle-fill"></i></button>}

                            </div>
                        </CardHeader>

                        <CardBody className="d-flex justify-content-center">
                            <Image
                                alt="service background"
                                className="rounded-xl bg-dark rounded"
                                width={300}
                                height={210}
                                src={`/cloud/azure/${link}.png`}
                            />
                        </CardBody>
                    </div>
                </Link>
            </div>
        </Card>
    );
}