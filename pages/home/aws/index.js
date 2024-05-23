import { useRouter } from "next/router";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Link from 'next/link';
import Image from "next/image";

export default function AWS() {
    const router = useRouter();

    const awsServices = [
        { name: "Elastic Computing Cloud", link: "ec2" },
        { name: "Security Groups", link: "security_groups" },
        { name: "Virtual Private Cloud", link: "vpc", },
        { name: "Simple Storage Service", link: "s3" },
        { name: "Relationnal Database Service", link: "rds" },
        { name: "Elastic Container Service", link: "ecs" },
        { name: "Amplify", link: "amplify" },
        { name: "Route 53", link: "route_53" },

    ]


    return (<>
        <p className="tilt-warp-title text-center m-5 h3 text-dark">Choose Your Service</p>
        <div className="d-flex row w-100 justify-content-center mx-auto text-dark">
            {awsServices.map((service, index) => (
                <AwsService key={index} name={service.name} link={service.link} />
            ))}

        </div>
    </>
    )
}


//dynamic cards content
const AwsService = ({ name,  link }) => {
    return (
        <Card className="mb-5 border border-dark  rounded mx-5 col-lg-2 col-md-4 col-sm-11 col-xs-11 down-to-up">
            <Link href={`/home/aws/${link}`} passHref>
                <CardHeader className="justify-between">
                    <div className="d-flex text-dark font-weight-bold flex-row justify-content-left align-items-center gap-5">
                        <div>
                            <Image className="rounded p-1" width={40} height={35} src="/cloud/aws/logo.png" alt="service logo"/>
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
                        height={250}
                        src={`/cloud/aws/${link}.png`}
                    />
                </CardBody>
            </Link>
        </Card>
    );
}