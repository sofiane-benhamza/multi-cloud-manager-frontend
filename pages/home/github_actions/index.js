import { useRouter } from "next/router";
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import Link from 'next/link';

export default function azure() {

    const azureServices = [
        { name: "Deploy on a static web app", link: "azure_static_web_app", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR0_YrITSMkpfxE2DTrbLk2KpChqgKhGoK18B2kfo0aQ&s" },
        

    ]


    return (<>
        <p className="tilt-warp-title text-center m-5 h3 text-dark">Choose Your Service</p>
        <div className="d-flex row w-100 justify-content-center mx-auto text-dark">
            {azureServices.map((service, index) => (
                <AzureService key={index} name={service.name} link={service.link} logoUrl={service.logoUrl} />
            ))}

        </div>
    </>
    )
}


//dynamic cards content
const AzureService = ({ name, logoUrl, link }) => {
    return (
        <Card className="mb-5 border border-dark  rounded mx-5 col-lg-2 col-md-4 col-sm-11 col-xs-11 down-to-up">
            <Link href={`/home/github_actions/${link}`} passHref>
                <CardHeader className="justify-between">
                    <div className="d-flex text-dark font-weight-bold flex-row justify-content-left align-items-center gap-5">
                        <div>
                            <Image   className="rounded p-1" width={40} height={35} src="https://static-00.iconduck.com/assets.00/microsoft-azure-icon-512x396-6fn0yfat.png" alt="Github logo"/>
                        </div>
                        <div className="ml-3 m-0">
                            <p className="tilt-warp-title h5">{name}</p>
                        </div>
                        {link && <button title="done" className="btn btn-success btn-lg ml-auto"><i className="bi bi-check-circle-fill"></i></button>}

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