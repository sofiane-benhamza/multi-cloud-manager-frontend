import Image from "next/image"

const Features = () => {
    return (
        <section id="features" className="features container-fluid">
            <div className="container">
                <div className="row section-title">
                    <h2>Features</h2>
                    <p>
                        There are many variations of cloud providers services, we make them easier to use.
                    </p>
                </div>
                <div className="row mt-5 feature-row">
                    <Feature title={"Fully Transparent"} desc={"Accurate information of work. Visualization achieved through the board."} logo={"/assets/images/services/s1.png"} />
                    <Feature title={"Fully Responsive"} desc={"Accurate information of work. Visualization achieved through the board."} logo={"/assets/images/services/s2.png"} />
                    <Feature title={"Cloud providers in one place"} desc={"Accurate information of work. Visualization achieved through the board."} logo={"/assets/images/services/s3.png"} />
                    <Feature title={"Easy to Use"} desc={"Accurate information of work. Visualization achieved through the board."} logo={"/assets/images/services/s4.png"} />
                    <Feature title={"Cloud Based"} desc={"Accurate information of work. Visualization achieved through the board."} logo={"/assets/images/services/s5.png"} />
                    <Feature title={"24 x 7 Support"} desc={"Accurate information of work. Visualization achieved through the board."} logo={"/assets/images/services/s6.png"} />
                </div>
            </div>
        </section>
    )
}

export default Features


const Feature = ({ title, desc, logo }) => {

    return (
        <div className="col-md-4">
            <div className="feature-col down-to-up">
                <Image width={100} height={100} src={logo} alt="" />
                <h4>{title}</h4>
                <p>
                    {desc}
                </p>
            </div>
        </div>
    )
}