import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation'
import "@/styles/globals.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "@/comps/Header";
import Warning from '@/comps/Warning';
import Router from '@/comps/Router';
import Footer from '@/comps/static/Footer';
import { getPersonnalInfo } from '@/utils/general';

function MyApp({ Component, pageProps }) {
  
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState("");
  const [username, setUsername] = useState("");

  const router = useRouter();

  // Keep track of history & logic of connection
  const allowedPagesWhileDisconnected = ['/', '/login', '/signup'];
  const pathname = usePathname();

  // Warning
  const [warning, setWarning] = useState({
    message: '',
    type: '', // Warning - success - danger
    isShown: false
  });

  const authContext = { token, isLoggedIn };

  // Get name of user on token change into valid value (setup)
  useEffect(() => {
    if (token) {
      if (token === "expired") {
        setIsLoggedIn(false)
        disconnect("your session has expired, please re-login");
      } else {
        setIsLoggedIn(true)
        getPersonnalInfo(token, setUsername, true).then((isOk) => {
          !isOk && setToken("expired");
        }) // True => get name only, get infos if token is valide
      }
    }
  }, [token])

  // Kick out anauthorized access to loggedIn templates
  useEffect(() => {
    if (!(isLoggedIn || allowedPagesWhileDisconnected.includes(pathname))) {
      router.push("/");
    }
  }, [isLoggedIn])


  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Restore session if refresh & loggedIn
    const RestoreSession = async () => {
      const localToken = localStorage.getItem("token");
      if (localToken) {
        getPersonnalInfo(localToken, setUsername, true)
          .then((isOk) => {
            if (isOk) {
              setToken(localToken)
              setIsLoggedIn(true)
            } else {
              setToken("expired")
            }
          })

      }
    }
    RestoreSession()

    // Loading animation
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };

  }, []);


  async function disconnect(reason) { //if  reason === undefind => user disconnected // reason === expired => token is dead 
    try {
      //delete token from server
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_ADDR}users/?` +
        new URLSearchParams({
          token: token,
          logout: true
        }),
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setIsLoggedIn(false)
        setToken(null)
        localStorage.removeItem("token")
        localStorage.removeItem("sessionExpireAt")
        setWarning({
          message: reason ? reason : "See you soon !",  //dont show any sign of existing account !
          type: reason ? "warning" : "success",
          isShown: true
        })
        router.push("/")
        return true;
      }
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return (
    <>
      <Warning warning={warning} loading={loading} setWarning={setWarning} />
      {loading && Loader()}
      <AuthContext.Provider value={authContext}>
        <Header disconnect={disconnect} username={username} />
        {isLoggedIn && <Router currentPath={pathname} />}
        <div className='d-flex min-vh-100 flex-column justify-content-between'>
          <div>
            <Component setToken={setToken} setWarning={setWarning} {...pageProps} />
          </div>
          <div>
            <Footer />
          </div>
        </div>
      </AuthContext.Provider>
    </>
  );
}


const Loader = () => {
  return (
    <div className=" d-flex justify-content-center align-items-center bg-light position-fixed vw-100" style={{ height: "calc(100vh - 80px)", bottom: "0", zIndex: "13" }}>
      <p className='loader'></p>
    </div>
  );
};


export const AuthContext = React.createContext({});
export default MyApp;