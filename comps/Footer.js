export default function Footer(){
    return (
        <footer className="bg-black text-light tilt-warp-title mt-5 vw-100">
        <div className="container py-3">
          <div className="row py-4 my-5">
            <div className="col-md-4">
              <p className="h3">Contact</p>
              <ul className="list-unstyled">
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Phone: +212 6 28 63 54 78</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Email: contact@matious.com</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Address: boulevard, Rabat, Morocco</span></li>
              </ul>
            </div>
            <div className="col-md-4">
            <p className="h3">Social media</p>
              <ul className="list-unstyled">
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Linkedin</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Twitter</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Instagram</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Facebook </span></li>
              </ul>
            </div>
            <div className="col-md-4">
            <p className="h3">Products</p>
              <ul className="list-unstyled">
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Cloud Management</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Creation of Websites</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Cybersecurity</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>IaC (Infrastructure as Code)</span></li>
              </ul>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-12 text-center ">
              <p><span className='hover-underline-light cursor-pointer py-1'>&copy; {new Date().getFullYear()} Matious Core</span></p>
            </div>
          </div>
        </div>
      </footer>

    )
}