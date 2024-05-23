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
                <div className="col-md-4">
                    <div className="feature-col">
                        <img    src="/assets/images/services/s1.png" alt="" />
                        <h4>Fully Transparent</h4>
                        <p>
                            Accurate information of work. Visualization achieved through the
                            board.
                        </p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="feature-col">
                        <img    src="/assets/images/services/s2.png" alt="" />
                        <h4>Cloud providers in one place</h4>
                        <p>
                            Just provide us the access, we will do the rest.
                        </p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="feature-col">
                        <img    src="/assets/images/services/s3.png" alt="" />
                        <h4>Fully Responsive</h4>
                        <p>
                            Accurate information of work. Visualization achieved through the
                            board.
                        </p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="feature-col">
                        <img    src="/assets/images/services/s4.png" alt="" />
                        <h4>Cloud Based</h4>
                        <p>
                            Accurate information of work. Visualization achieved through the
                            board.
                        </p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="feature-col">
                        <img    src="/assets/images/services/s5.png" alt="" />
                        <h4>Easy to Use</h4>
                        <p>
                            Accurate information of work. Visualization achieved through the
                            board.
                        </p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="feature-col">
                        <img    src="/assets/images/services/s6.png" alt="" />
                        <h4>24 x 7 Support</h4>
                        <p>
                            Accurate information of work. Visualization achieved through the
                            board.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    )
}

export default Features