import { useRouter } from "next/router";
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import { useEffect, useContext } from "react";
import Link from 'next/link';
import { MyAppContext } from '../_app.js';



export default function Home() {

    const router = useRouter();

    const CloudProviderCard = (name, label, numberOfServices, link, srcOfImage) => {
        return (
            <Card className="py-4 mb-5 border  border-dark mx-5 col-lg-3 col-md-4 col-sm-11 col-xs-11 down-to-up"
                style={{ width: "306px", maxHeight: "400px" }}>
                <Link href={`/home/${link}`} passHref>
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <p className="text-tiny uppercase font-bold">{name}</p>
                        <small className="text-default-500">{numberOfServices} Managed Services</small>
                        <h4 className="font-bold text-large">{label}</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2 d-flex justify-content-center">
                        <Image
                            alt="Card background"
                            className="object-cover rounded-xl bg-light rounded"
                            src={srcOfImage}
                            width={270}
                        />
                    </CardBody>
                </Link>
            </Card>
        );
    }

    return (<>
        <h2 className="text-center text-dark mt-3 mb-5">Choose Your Cloud Provider</h2>
        <div className="d-flex row w-100 justify-content-center text-dark" style={{ minHeight: "calc( 100vh - 200px )" }}>
            {CloudProviderCard("Amazon Web Services", "Leader of Cloud Providers", "12", "aws","https://wiseit.com.ua/wp-content/uploads/2022/09/media_1649ebc3fbbce0df508081913819d491fc3f7c7a9.png")}
            {CloudProviderCard("Google Cloud Platform", "Master Search Engine Creator", "5", "gcp","https://webizona.com/wp-content/uploads/2024/02/Group-5511.svg")}
            {CloudProviderCard("Microsoft Azure", "Creator of Microsoft Windows", "5", "azure","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwyIXFUIHawuZxZWJrdQnnCRsmIJ7IvrRUJw&usqp=CAU")}
        </div>
    </>
    )
}