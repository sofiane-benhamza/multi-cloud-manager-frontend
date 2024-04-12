import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation'
import React from 'react';
import Header from "../comps/Header";
import "../styles/globals.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useRouter } from 'next/router';
import Warning from '../comps/Warning';
import Router from '../comps/Router';


function MyApp({ Component, pageProps }) {
  const [token, setToken] = useState("");
  const router = useRouter();
  
  // Keep tracking history & logic of connection
  const allowedPagesWhileDisconnected = ["/", "/login", "/signup"];
  const pathname = usePathname();
  const [previousPathname, setPreviousPathname] = useState('');
  
  // Warning
  const [warning, setWarning] = useState(
    {
      message: "something went wrong ... ",
      type: "warning",  // Warning - success - danger
      isShown: false
    }
  )
  const params = { token };

  // Only to keep tracking of routing system
  const handleRouteChange = (url) => {
    var storedToken;
    if (!previousPathname) { // Page reloaded detected
      if (typeof window !== 'undefined' && localStorage) { // Check for window and localStorage availability
        storedToken = localStorage.getItem('token');
        storedToken && setToken(storedToken);
      }else{
        console.warn("local storage is not available");
      }
    }
    setPreviousPathname(url);
    if (allowedPagesWhileDisconnected.includes(url) && storedToken) {
      router.push("/home"); // Redirect to home if logged in
    }
  }
  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [previousPathname, router]);
  useEffect(() => {
    handleRouteChange(pathname);
  }, [])  //refresh detect

  return (
    <>
      <FullContext.Provider value={params}>
        <Warning warning={warning} setWarning={setWarning} />
        <Header setToken={setToken} setWarning={setWarning}/>
        {previousPathname && <Router currentPath={previousPathname} />}
        <Component setToken={setToken} setWarning={setWarning} {...pageProps} />
      </FullContext.Provider>
    </>
  );
}
export const FullContext = React.createContext({});
export default MyApp;