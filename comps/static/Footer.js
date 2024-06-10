import { useState, useEffect } from "react";
export default function Footer() {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 800);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);



  return (
    <>

      <footer className="bg-black text-light tilt-warp-title vw-100">
        <div className="container pt-3">
          <div className="row py-4 my-5">
            <div className="col-md-3">
              <p className="h3">Contact</p>
              <ul className="list-unstyled">
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>+212 6 47 27 29 48</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>matiouscore@gmail.com</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>boulevard, Rabat, Morocco</span></li>
              </ul>
            </div>
            <div className="col-md-3">
              <p className="h3">Social media</p>
              <ul className="list-unstyled">
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Github</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Discord</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Linkedin</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Twitter</span></li>
              </ul>
            </div>
            <div className="col-md-3">
              <p className="h3">Products</p>
              <ul className="list-unstyled">
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Cloud Management</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>IaC (Infrastructure as Code)</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Full-Stack Web Apps</span></li>
                <li className='py-2'><span className='hover-underline-light cursor-pointer py-1`'>Cybersecurity</span></li>
              </ul>
            </div>
            <div className="col-md-3 tags">
              <p className="h3">Tags</p>
              <ul>
                <li className="tags-inverse-hover">Cloud Computing</li>
                <li className="tags-inverse-hover">Django</li>
                <li className="tags-inverse-hover">Next Js</li>
                <li className="tags-inverse-hover">AWS</li>
                <li className="tags-inverse-hover">Node Js</li>
                <li className="tags-inverse-hover">GCP</li>
                <li className="tags-inverse-hover">Spring boot</li>
                <li className="tags-inverse-hover">Azure</li>
                <li className="tags-inverse-hover">Web Design</li>
                <li className="tags-inverse-hover">Terraform</li>
              </ul>
            </div>
          </div>
        </div>
        { !isAtTop &&
        <a href="#" title="scroll to top" className="text-dark btn btn-lg btn-light btn-lg-square border border-dark back-to-top">
          <i className="bi bi-arrow-up-square" />
        </a>
        }
      </footer>
      <div className="copy bg-black">
        <div className="container border border-light p-3 pb-1">
          <a href="https://www.matious.com/">
            2024 © All Rights Reserved | Designed and Developed by Matious Digital
          </a>
          <span>
            <a>
              <i className="bi bi-github" />
            </a>
            <a>
              <i className="bi bi-discord" />
            </a>
            <a>
              <i className="bi bi-google" />
            </a>
            <a>
              <i className="bi bi-twitter" />
            </a>
          </span>
        </div>
      </div>
    </>

  )
}