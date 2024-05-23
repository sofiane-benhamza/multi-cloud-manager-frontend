import Image from "next/image"

const Services = () => {
    return (<>

        <section id="home" className="container-fluid d-flex main-home-element banner-container tilt-warp-title">
            <div className="container">
                <div className="row banner-row">
                    <div className="col-md-6">
                        <h1>We Provide Best and Very Secure Cloud Management Services</h1>
                        <p>Our team has one goal: to make cloud services simpler and simpler. We understand that navigating the cloud can be complex and challenging for businesses of all sizes.</p>
                        <p>Our mission is to streamline these processes, ensuring that our clients can leverage the full potential of cloud technology without unnecessary complications.</p>


                        <div className="btn-row row">
                            <button className="btn btn-primary">Read More</button>
                            <button className="btn btn-outline-primary">Create Account</button>
                        </div>
                    </div>
                    <div className="col-md-6 banner-img">
                        <img    src="/assets/images/slider.png" alt="" />
                    </div>
                </div>
            </div>
        </section>

    </>)
}

export default Services