import { useRouter } from "next/router";
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import Link from 'next/link';

export default function AWS() {
    const router = useRouter();

    //dynamic cards content
    const AwsService = (name, logoUrl, link) => {
        let url = (link ? link : "");    
        return (
            <Card className="mb-5 border border-dark  rounded mx-5 col-lg-2 col-md-4 col-sm-11 col-xs-11 down-to-up">
                <Link href={`/home/aws/${url}`} passHref>
                    <CardHeader className="justify-between">
                        <div className="d-flex text-dark font-weight-bold flex-row justify-content-left align-items-center gap-5">
                            <div>
                                <img className="rounded p-1" width="40px" height="35px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png" />
                            </div>
                            <div className="ml-3 m-0">
                            <p className="tilt-warp-title h5">{name}</p>
                            </div>
                            {url && <button title="done" className="btn btn-success btn-lg ml-auto"><i className="bi bi-check-circle-fill"></i></button>}

                        </div>
                    </CardHeader>

                    <CardBody className="d-flex justify-content-center">
                        <Image
                            width="100%"
                            alt="Card background"
                            className="object-cover rounded-xl bg-dark rounded"
                            src={logoUrl}
                        />
                    </CardBody>
                </Link>
            </Card>
        );
    }

    return (<>
        <p className="tilt-warp-title text-center m-5 h3 text-dark">Choose Your Service</p>
        <div className="d-flex row w-100 justify-content-center text-dark">
            {AwsService("Elastic Computing Cloud", "https://www.logicata.com/wp-content/uploads/2020/08/Amazon-EC2@4x-e1593195270371.png", "ec2")}
            {AwsService("Security Groups","https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/modules/aws-cloud-security/learn-about-aws-security-services/images/8d03a75da1004ae7489a19260cb70889_84-e-710-e-4-cd-3-b-4301-9744-07-fcc-43-b-059-a.png","security_groups")}
            {AwsService("Virtual Private Cloud", "https://miro.medium.com/v2/resize:fit:640/format:webp/1*BuZ7po9jRBMftzVV_9-lMw.png", "vpc")}
            {AwsService("Simple Storage Service", "https://cdn.worldvectorlogo.com/logos/amazon-s3-simple-storage-service.svg","s3")}
            {AwsService("Relationnal Database Service", "https://www.logicata.com/wp-content/uploads/2020/08/Amazon-RDS@4x.png","rds")}
            {AwsService("Elastic Container Service", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVCr47BYUmjvnT49j1-lrHpe1S6yd5W5mMcA&usqp=CAU","ecs")}
            {AwsService("Amplify", "https://res.cloudinary.com/practicaldev/image/fetch/s--mkZY0XpP--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_800/https://day-journal.com/memo/images/logo/aws/amplify.png")}
            {AwsService("Route 53", "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fthecloudbootcamp.com%2Fwp-content%2Fuploads%2F2021%2F01%2Faws-route-53.png&f=1&nofb=1&ipt=b487252a1374ce634894fd2e20b69204554beca90888fb174bbb3881cf8b0a62&ipo=images")}

        </div>
    </>
    )
}