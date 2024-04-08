"use client";
import Head from 'next/head';
import { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Slider from "../comps/Slider";
import * as React from "react"

export default function Home() {

    const router = useRouter();

    return (
      <div>
        <Head>
          <title>Matious Cloud Provider Manager</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <section>
          <div className="container">
            <div className="row text-dark">
              <div className="col text-center mt-5 mb-5">
                <h2 >Managing</h2>
                <h1 className="display-4 font-weight-bolder">
                  Cloud Providers Easily{" "}
                </h1>
                <p className="lead text-light">
                  The most trusted way to manage cloud services :){" "}
                </p>
              </div>
            </div>
            <div className=" w-100">
        <Slider />

            </div>
            <div style={{height:"100px"}}></div>
            <h3 className="text-center" >
              <i className="bi bi-arrow-left-circle-fill"></i>
              <p className='px-5 d-inline'>slide left or right</p>
              <i className="bi bi-arrow-right-circle-fill"></i>
              </h3>

          </div>
        </section>
      </div>
    )
  }