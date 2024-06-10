import Image from "next/image"

const AboutUs = () => {
    return (<section id="aboutus" className="container-fluid about-coo bg-pale">
        <div className="container">
            <div className="row section-title">
                <h2>About Us</h2>
                <p>
                    Matious Core simplifies the integration and management of your existing resources across various cloud providers with just one click.
                    Our user-friendly platform streamlines the process, offering straightforward manipulation options for your infrastructure.

                </p>
            </div>
            <div className="row about-row">
                <div className="col-md-5 about-img">
                    <Image width={300} height={200} src="/assets/images/about.png" alt="" />
                </div>
                <div className="col-md-6 about-text">
                    <h1>We are the Leading Cloud Services Manager</h1>
                    <p>
                        Whether you're migrating from AWS, Azure, Google Cloud, or other providers, Matious Core ensures seamless transition and easy access to all your resources.
                        With intuitive controls and a unified interface, managing your cloud assets has never been easier. Welcome to a new era of simplified cloud management with Matious Core.

                    </p>
                    <div className="about-featur">
                        <ul>
                            <li>
                                <i className="fa fa-check" /> Boost SEO Sharing
                            </li>
                            <li>
                                <i className="fa fa-check" /> Social Sharing
                            </li>
                            <li>
                                <i className="fa fa-check" /> Marketing
                            </li>
                            <li>
                                <i className="fa fa-check" /> Retention
                            </li>
                            <li>
                                <i className="fa fa-check" /> Visual Review
                            </li>
                            <li>
                                <i className="fa fa-check" /> Review Generation
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>)
}

export default AboutUs