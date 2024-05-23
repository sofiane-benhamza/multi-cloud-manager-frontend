import Image from "next/image"

const AboutUs = () => {
    return (        <section  id="aboutus" className="container-fluid about-coo bg-pale">
    <div className="container">
        <div className="row section-title">
            <h2>About Us</h2>
            <p>
                It is a long established fact that a reader will be distracted by the
                readable content of a page when looking at its layout. The point of
                using Lorem Ipsum is that it has.
            </p>
        </div>
        <div className="row about-row">
            <div className="col-md-5 about-img">
                <img    src="/assets/images/about.png" alt="" />
            </div>
            <div className="col-md-6 about-text">
                <h1>We are the Leading Cloud Services Manager</h1>
                <p>
                    It is a long established fact that a reader will be distracted by
                    the readable content of a page when looking at its layout. The point
                    of using Lorem Ipsum is that it has.
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