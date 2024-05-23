const MidHeader = () => {


    return (
        <div className="head-cover">
            <div id="collapseExample" className="col-11 d-flex justify-content-end">
                <ul className="d-flex flex-row py-3">
                    <li className="px-2">
                        <a className="hover-underline-black pb-1" href="#home">Home</a>
                    </li>
                    <li className="px-2">
                        <a className="hover-underline-black pb-1" href="#services">Services</a>
                    </li>
                    <li className="px-2">
                        <a className="hover-underline-black pb-1" href="#features">Features</a>
                    </li>
                    <li className="px-2">
                        <a className="hover-underline-black pb-1" href="#aboutus">About Us</a>
                    </li>
                    <li className="pl-2">
                        <button className="btn btn-sm btn-primary">
                            <a href="#footer">Get in touch</a>
                        </button>
                    </li>
                </ul>
            </div>
        </div>)
}

export default MidHeader