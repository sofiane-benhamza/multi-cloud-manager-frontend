import React, { useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AuthContext } from './_app';


const Custom404 = () => {
  const router = useRouter();
  const {token} = useContext(AuthContext);
  const redirect = (path) => {
        if(path=="back"){
          router.back()
        }else{
          router.push(path)
        }
  }
  
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 tilt-warp-title">
      <h1>404 - Page Not Found</h1>
      <Image src={"/404.gif"} alt="sad cloud" width={500} height={500} />
      <p>This is not the web page you are looking for.</p>
      <p>
        <button 
        className='btn btn-dark btn-lg mx-2 p-2'
        onClick={()=>{redirect(token ? "./home":"./")}}
        >Go home</button>
        <button 
        className='btn btn-dark btn-lg mx-2 p-2'
        onClick={()=>{redirect("back")}}
        >Go back</button>
      </p>
    </div>
  );
};

export default Custom404;
