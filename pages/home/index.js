import { useRouter } from "next/router";
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import Link from 'next/link';


export default function Home() {

    const router = useRouter();

    const cloudProviders = [{ name: "Amazon Web Services", label: "The Leader  of  Cloud  Providers", numberOfServices: "12", link: "aws", srcOfLogo: "https://wiseit.com.ua/wp-content/uploads/2022/09/media_1649ebc3fbbce0df508081913819d491fc3f7c7a9.png" },
    { name: "Google Cloud Platform", label: "Master Search Engine Founder", numberOfServices: "5", link: "gcp", srcOfLogo: "https://webizona.com/wp-content/uploads/2024/02/Group-5511.svg" },
    { name: "Microsoft Azure", label: "Creator of Microsoft Windows", numberOfServices: "5", link: "azure", srcOfLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwyIXFUIHawuZxZWJrdQnnCRsmIJ7IvrRUJw&usqp=CAU" }
    ]

    return (
        <>
            <p className="tilt-warp-title text-center my-5 h2 text-dark">Chooe Your Cloud Provider</p>
            <div className="d-flex flex-wrap w-100 justify-content-center text-dark my-5">
                {cloudProviders.map((cloudProvider, index) =>
                    <CloudProviderCard key={index} name={cloudProvider.name} label={cloudProvider.label} numberOfServices={cloudProvider.numberOfServices} link={cloudProvider.link} srcOfLogo={cloudProvider.srcOfLogo} />
                )}
            </div>
        </>
    )
}

const CloudProviderCard = ({ name, label, numberOfServices, link, srcOfLogo }) => {
    return (
        <Card className="py-4 mb-5 border  border-dark mx-5 col-xl-2 col-lg-3 col-md-4 col-sm-11 col-xs-11 down-to-up"
            style={{ width: "306px", maxHeight: "400px" }}>
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
                        src={srcOfLogo}
                        width={270}
                        height={170}
                    />
                </CardBody>
            </Link>
        </Card>
    );
}