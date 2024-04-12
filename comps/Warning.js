import React, { useEffect, useState } from "react";

export default function Warning({ warning, setWarning }) {
    const [closeButtonDisabled, setCloseButtonDisabled] = useState(true);
    const [counter, setCounter] = useState(5);
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
        if (counter === 0) {
            setCloseButtonDisabled(false);
            setCounter(4);
        }
    }, [counter]);

    return (warning.isShown ?
        <div className="vw-100 vh-100 d-flex justify-content-center align-items-center position-absolute" style={{ backdropFilter: "blur(8px)", zIndex: "6" }}>
            <div className="card text-right border border-dark  rounded m-5 col-xl-4 col-lg-6 col-md-7 col-sm-10 col-xs-12">
                <div className="card-body tilt-warp-title h4">
                    <p className="card-text  text-dark text-left">{warning.message}</p>
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
                        disabled={closeButtonDisabled}
                    >
                        {closeButtonDisabled ? `Processing ... ${counter} `:"Close"}
                    </button>
                </div>
            </div>
        </div>
        : null)
}
