import { useRouter } from "next/router";
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import Link from 'next/link';

export default function azure() {
    const router = useRouter();

    const azureServices = [
        { name: "Virtual Machines", link: "vm", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT93J5ffCEgZfd-B-ftT6tI8iXXq7gvMqXipmtqhRlQYA&s" },
        { name: "Resource Groups", link: "rg", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeTkbWN7ZaVIBgjtTkUsyOnKUNApNCQ0C3k-xSLuRIEw&s" },
        { name: "Virtual Networks", link: "vn", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj9aP5wtrWa0O3TmCt79gepiiuXBGZFJMUSfhMUaQHwQ&s" },
        { name: "Static Web App", link: "static_web_app", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR0_YrITSMkpfxE2DTrbLk2KpChqgKhGoK18B2kfo0aQ&s" },
        { name: "Files", link: "", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgdZVYUFOAzwO_dpemIgIbVSlWr3QJrYZXECBun4zMu5_LQi__JsJm4E8fJSzk1LSQjXg&usqp=CAU" },
        { name: "Database for PostgreSQL", link: "", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFwoZHA1OBt-zd1K00RqqT0g8BFvFC65_Kl6izYyfpCQ&s" },
        { name: "SQL database", link: "sql", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc_64CjOyGJLsCuHz5JPVGqo_OceWn5GjngCP5hIY79Q&s" },
        { name: "Database for MySQL", link: "", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR46UFpSVTXzgTSzFtKRIOJM9YwEiC3AzCckdKwjFL3WQ&s" },
        { name: "Azure Cosmos DB", link: "", logoUrl: "https://logowik.com/content/uploads/images/azure-cosmos-db7049.jpg" },
        

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
            <Link href={`/home/azure/${link}`} passHref>
                <CardHeader className="justify-between">
                    <div className="d-flex text-dark font-weight-bold flex-row justify-content-left align-items-center gap-5">
                        <div>
                            <img   className="rounded p-1" width="40px" height="35px" src="https://static-00.iconduck.com/assets.00/microsoft-azure-icon-512x396-6fn0yfat.png" />
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