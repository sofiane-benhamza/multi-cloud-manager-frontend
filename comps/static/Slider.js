import React, { useEffect, useState } from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';
import Image from "next/image"


export default function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0) //dots
  const [loaded, setLoaded] = useState(false)
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
  })

  useEffect(() => {
    let autoClicker = setInterval(() => {
      instanceRef.current?.next();
    }, 3500);

    // Clean up the timer when the component unmounts or when necessary
    return () => clearInterval(autoClicker);
  }, []); // Empty dependency array means this effect runs only once, similar to componentDidMount

  return (
    <>
      <div className="navigation-wrapper">
        <div ref={sliderRef} className="keen-slider">
          <div className="keen-slider__slide number-slide1">
            <CloudProvider provider={"Amazon Web Services, Inc."} description={"a subsidiary of Amazon that provides on-demand cloud computing platforms and APIs to individuals."} logo={"aws"} />
          </div>
          <div className="keen-slider__slide number-slide2">
            <CloudProvider provider={"Microsoft Azure, Inc."} description={"Microsoft Azure, often referred to as Azure, is a cloud computing platform run by Microsoft."} logo={"azure"} />
          </div>
          <div className="keen-slider__slide number-slide3">
          <CloudProvider provider={"Google Cloud Platform"} description={"Google Cloud Platform, offered by Google, is a suite of cloud computing services"} logo={"gcp"} />
          </div>
          <div className="keen-slider__slide number-slide4">
            <CloudProvider provider={"Cloud Provider, Inc."} description={"Coming Soon.."} logo={"coming"} />
          </div>        </div>
        {loaded && instanceRef.current && (
          <>
            <Arrow
              left
              onClick={(e) =>
                e.stopPropagation() || instanceRef.current?.prev()
              }
            />

            <Arrow
              onClick={(e) =>
                e.stopPropagation() || instanceRef.current?.next()
              }
            />
          </>
        )}
      </div>
      {loaded && instanceRef.current && (
        <div className="dots">
          {[
            ...Array(instanceRef.current.track.details.slides.length).keys(),
          ].map((idx) => {
            return (
              <button
                key={idx}
                onClick={() => {
                  instanceRef.current?.moveToIdx(idx)
                }}
                className={"dot" + (currentSlide === idx ? " active" : "")}
              ></button>
            )
          })}
        </div>
      )}

      <h4 className="d-flex justify-content-center text-dark row" >
        <i className="bi bi-arrow-left-circle-fill cursor-pointer"
          onClick={(e) =>
            instanceRef.current?.prev()
          } ></i>
        <p className='px-3 d-inline'>slide left or right</p>
        <i className="bi bi-arrow-right-circle-fill cursor-pointer"
          onClick={() =>
            instanceRef.current?.next()
          }        ></i>
      </h4>
      <br /><br />
    </>
  )
}

function Arrow(props) {
  const disabled = props.disabled ? " arrow--disabled" : ""
  return (
    <svg
      onClick={props.onClick}
      className={`arrow ${props.left ? "arrow--left" : "arrow--right"} ${disabled}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
    >
      {props.left && (
        <path fill="black" d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
      )}
      {!props.left && (
        <path fill="black" d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
      )}
    </svg>

  )
}

const CloudProvider = ({ provider, description, logo }) => {
  return (
    <Card sx={{ maxWidth: 470 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={`/assets/slider/${logo}.png`}
          alt="cloud provider"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            <span className="tilt-warp-title">
              {provider}
            </span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <span className="tilt-warp-title">
              {description}
            </span>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
