import React, { useEffect, useState } from "react";
import Typewriter from 'typewriter-effect';


export default function Warning({ warning, setWarning, loading }) {
    const [closeButtonDisabled, setCloseButtonDisabled] = useState(true);
    const [counter, setCounter] = useState(3);
    var interval;
    useEffect(() => {
        if (warning.isShown) {
            interval = setInterval(() => {
                setCounter(prevCounter => prevCounter - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [warning.isShown]);

    useEffect(() => {
        if (counter === 0 || !loading) {
            setCloseButtonDisabled(false);
            setCounter(3);
            clearInterval(interval);
        }
    }, [counter]);

    return (warning.isShown ?
        <div className="vw-100 vh-100 d-flex justify-content-center align-items-center position-fixed" style={{ backdropFilter: "blur(8px)", zIndex: "12"}}>
            <div className="card text-right border border-dark  m-5 col-xl-4 col-lg-6 col-md-7 col-sm-10 col-xs-12"
            style={{background: "rgba(255,255,255,.7)", borderRadius:"10px"}}>
                <div className="card-body text-left tilt-warp-title h4">
                    <Typewriter
                        options={{
                            delay: 50, 
                            cursor: '|',
                        }}
                        onInit={(typewriter) => {
                            typewriter
                                .typeString(warning.message)
                                .pauseFor(10)
                                .start();
                        }}
                    />
                    <div className="text-right mt-4">
                        <button
                            className={`btn btn-${warning.type} btn-lg mb-0 mt-auto`}
                            onClick={() => {
                                setWarning(prevState => ({
                                    ...prevState,
                                    isShown: false
                                }));
                                setCloseButtonDisabled(true);
                                clearInterval(interval);
                            }}
                            style={{ cursor: closeButtonDisabled ? 'wait' : 'pointer' }}
                            disabled={closeButtonDisabled}
                        >
                            {closeButtonDisabled ? `Processing ... ${counter} ` : "Close"}
                        </button>
                    </div>
                </div>
            </div>
        </div >
        : null)
}
