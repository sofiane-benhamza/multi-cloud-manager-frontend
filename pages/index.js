"use client";
import Head from 'next/head';
import { useRouter } from 'next/router';
import Slider from "@/comps/static/Slider";
import Typewriter from 'typewriter-effect';
import { useEffect, useContext } from 'react';
import { AuthContext } from "./_app";
import Services from '@/comps/static/Services';
import AboutUs from '@/comps/static/AboutUs';
import Features from '@/comps/static/Features';
import MidHeader from '@/comps/static/MidHeader';

export default function Home() {

  const { isLoggedIn } = useContext(AuthContext);
  const router = useRouter();

  const services = [{ theme: "primary", title: "DATA LAYER", comment: "Easy to use", desc: "Matious Core is a solution that provides developers and cloud enthusiasts, that works with more than one provider, a faster manipulation of Multi-Cloud infrastracture" },
  { theme: "warning", title: "FRONTEND CLOUD", comment: "Faster deployment", desc: "all it takes here to get your application online, is to provide your github repository, and the way you want it to be deployed, and we take care of everything else." },
  { theme: "success", title: "EXTENSIVE UI", comment: "Friendly Editors", desc: "We bring all your existents resources into Matious core, by one click, from any cloud provider, in a easy friendly way, with much easier manipulation options" }]

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/home");
    }
  }, [isLoggedIn, router])



  return (
    <>
      <Head>
        <title>Matious Cloud Provider Manager</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MidHeader />
      <Services />
      <br />
      <section className='tilt-warp-title'>
        <div className="container" id="services">
          <div className="row text-dark">
            <div className="col text-center mt-5 mb-5">
              <h2 className='textsmall'>Managing</h2>
              <h1 className="display-5">
                Cloud Providers Easily
              </h1>
              <p className="lead text-dark my-4">
                The most trusted way to manage cloud services
              </p>
            </div>
          </div>
          <div className=" w-100">
            <Slider />

          </div>
        </div>
        <Features />
        <TypewriterCard />
        <AboutUs />
        <div className='d-flex flex-wrap container py-5'>
          {services.map((service, index) => (
            <Service key={index} theme={service.theme} title={service.title} comment={service.comment} desc={service.desc} />
          ))}
        </div>
      </section>
      <section className='tilt-warp-title bg-pale'>
        <div className="text-dark d-flex container justify-content-center overflow-hidden ">
          <div className="col text-center my-5 mx-3 py-5 border border-dark rounded-10 background">
            <span className='star' />
            <span className='star' />
            <span className='star' />
            <span className='star' />
            <span className='star' />
            <span className='star' />
            <span className='star' />
            <span className='star' />
            <span className='star' />
            <span className='star' />
            <h1 className="h3 text-light">
              So, Ready to try Matious Core ?
            </h1>
            <p className="lead text-dark my-4">
              <button className='btn btn-primary'>Request a demo</button>
            </p>
          </div>
        </div>
      </section>
      <div className="bg-primary my-0 text-light h4" id="footer">
      <div className="container py-2 d-flex align-items-center">
        <p className="mb-0 d-flex h6 align-items-center">
          Are you looking for a consultant for your Business
          <button className="btn btn-light ml-3">Contact Us</button>
        </p>
      </div>
    </div>

    </>
  )
}

const TypewriterCard = () => {
  return (
    <div className="vw-100 d-flex flex-wrap justify-content-center align-items-center my-5">
      <div className='mt-5 p-5 border-top border-left border-bottom border-dark col-xl-3 col-lg-4 col-md-5 bg-beach'>
        <div className="mb-4">
          <h4>you can manage</h4>
          <h3><Typewriter
            options={{
              loop: true, // Set loop option to true
            }}
            onInit={(typewriter) => {
              typewriter
                .typeString('Amazon Web Services')
                .pauseFor(1000)
                .deleteAll()
                .typeString('Microsoft Azure')
                .pauseFor(1000)
                .deleteAll()
                .typeString('Google Cloud Platform')
                .pauseFor(1000)
                .deleteAll()
                .start();
            }}
          /></h3>
          <h4>Simply, Smoothly, Effortlessly</h4>
        </div>
        <div className='row d-flex justify-content-center mt-3'>
          <p className='btn-beach'>Start using</p>

          <p className='btn-beach'>Learn more</p>
        </div>
      </div>
      <div className='mt-5 p-5 border-top border-right border-bottom border-dark col-xl-3 col-lg-4 col-md-5 bg-ocean'>
        <table>
          <tbody>
            <tr>
              <td><span className="h4 beautiful-number mr-4">+ 213&nbsp; </span></td>
              <td>Managed service</td>
            </tr>
            <tr>
              <td><span className="h4 beautiful-number mr-4">+ 16,382 </span></td>
              <td>Client over the world</td>
            </tr>
            <tr>
              <td><span className="h4 beautiful-number mr-4">+ 8 </span></td>
              <td>Countries over Europe</td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  )
}

const Service = ({ theme, title, comment, desc }) => {
  return (
    <div className="my-4 col-xl-4 col-lg-4 col-md-6 col-sm-10 col-xs-12">
      <div className='border border-dark rounded px-3 py-5  down-to-up h-100 d-flex flex-column justify-content-between'>
        <div>
          <span className={`p-2 alert alert-${theme}`}>{title}</span>
          <p className="h4 pt-4">{comment}</p>
          <p>{desc}</p>
        </div>
        <div>
          <hr />
          <p className=" d-inline hover-underline-black cursor-pointer">Learn More</p>
        </div>
      </div>
    </div>
  );
};