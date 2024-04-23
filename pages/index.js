"use client";
import Head from 'next/head';
import { useRouter } from 'next/router';
import Slider from "../comps/Slider";
import Typewriter from 'typewriter-effect';
import { useEffect, useContext } from 'react';
import { FullContext } from "./_app";

export default function Home() {

  const { isLoggedIn } = useContext(FullContext);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/home");
    }
  }, [isLoggedIn])

  const router = useRouter();
  return (
    <>
      <Head>
        <title>Matious Cloud Provider Manager</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className='tilt-warp-title'>
        <div className="container">
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
        {DefinitionCard()}
        <hr />
        <div className='d-flex flex-wrap container py-5'>
          {Service("primary", "DATA LAYER", "Easy to use", "Matious Core is a solution that provides developers and cloud enthusiasts, that works with more than one provider, a faster manipulation of Multi-Cloud infrastracture")}
          {Service("warning", "FRONTEND CLOUD", "Faster deployment", "all it takes here to get your application online, is to provide your github repository, and the way you want it to be deployed, and we take care of everything else.")}
          {Service("success", "EXTENSIVE UI", "Friendly Editors", "We bring all your existents resources into Matious core, by one click, from any cloud provider, in a easy friendly way, with much easier manipulation options")}
        </div>
        <div className="text-dark d-flex container justify-content-center">
          <div className="col text-center my-5 mx-3 py-5 border border-dark rounded-10 background">
            <h1 className="h3 text-light">
              So, Ready to try Matious Core ?
            </h1>
            <p className="lead text-dark my-4">
              <button className='btn btn-primary'>Request a demo</button>
            </p>
          </div>
        </div>
      </section>

    </>
  )
}

const DefinitionCard = () => {
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

const Service = (theme, title, desc, text) => {
  return (
    <div className="my-4 col-xl-4 col-lg-4 col-md-6 col-sm-10 col-xs-12">
      <div className='border border-dark rounded px-3 py-5  down-to-up h-100 d-flex flex-column justify-content-between'>
        <div>
          <span className={`p-2 alert alert-${theme}`}>{title}</span>
          <p className="h4 pt-4">{desc}</p>
          <p>{text}</p>
        </div>
        <div>
          <hr />
          <p className=" d-inline hover-underline-black cursor-pointer">Learn More</p>
        </div>
      </div>
    </div>
  );
};