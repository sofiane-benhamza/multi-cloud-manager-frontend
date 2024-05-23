export default function Footer() {
  return (
    <>

      <footer className="bg-black text-light tilt-warp-title vw-100">
        <div className="container pt-3">
          <div className="row py-4 my-5">
            <div className="col-md-3">
              <p className="h3">Contact</p>
              <ul className="list-unstyled">
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Phone: +212 6 28 63 54 78</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Email: contact@matious.com</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Address: boulevard, Rabat, Morocco</span></li>
              </ul>
            </div>
            <div className="col-md-3">
              <p className="h3">Social media</p>
              <ul className="list-unstyled">
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Linkedin</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Twitter</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Instagram</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Facebook </span></li>
              </ul>
            </div>
            <div className="col-md-3">
              <p className="h3">Products</p>
              <ul className="list-unstyled">
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Cloud Management</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Creation of Websites</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Cybersecurity</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>IaC (Infrastructure as Code)</span></li>
              </ul>
            </div>
            <div className="col-md-3 tags">
              <p className="h3">Easy Tags</p>
              <ul>
                <li className="tags-inverse-hover">Cloud Computing</li>
                <li className="tags-inverse-hover">Internet Pro</li>
                <li className="tags-inverse-hover">Node Js</li>
                <li className="tags-inverse-hover">Java</li>
                <li className="tags-inverse-hover">Next Js</li>
                <li className="tags-inverse-hover">Web Design</li>
                <li className="tags-inverse-hover">Django</li>
              </ul>
            </div>
          </div>
        </div>
        <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top">
          <i className="bi bi-arrow-up-square" />
        </a>
      </footer>
      <div className="copy bg-black">
        <div className="container border border-light p-3 pb-1">
          <a href="https://www.smarteyeapps.com/">
            2024 © All Rights Reserved | Designed and Developed by Matious Digital
          </a>
          <span>
            <a>
              <i className="bi bi-github" />
            </a>
            <a>
              <i className="bi bi-google" />
            </a>
            <a>
              <i className="bi bi-pinterest" />
            </a>
            <a>
              <i className="bi bi-twitter" />
            </a>
            <a>
              <i className="bi bi-facebook" />
            </a>
          </span>
        </div>
      </div>
    </>

  )
}