import React from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';

const carousel = (slider) => {
  const z = 300
  function rotate() {
    const deg = 360 * slider.track.details.progress
    slider.container.style.transform = `translateZ(-${z}px) rotateY(${-deg}deg)`
  }
  slider.on("created", () => {
    const deg = 360 / slider.slides.length
    slider.slides.forEach((element, idx) => {
      element.style.transform = `rotateY(${deg * idx}deg) translateZ(${z}px)`
    })
    rotate();

  })
  slider.on("detailsChanged", rotate)
}

export default function Slider() {
  const [sliderRef] = useKeenSlider(
    {
      loop: true,
      selector: ".carousel__cell",
      renderMode: "custom",
      mode: "free-snap",
    },
    [carousel]
  )
  const XCard = (provider, description, logo) => {
    return (
      <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={logo}
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
          {provider}   
          </Typography>
          <Typography variant="body2" color="text.secondary">
          {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
    )
  }

  return (
    <div className="wrapper ">
      <div className="scene">
        <div className="carousel keen-slider" ref={sliderRef}>
          <div className="carousel__cell number-slide1 ">
          {XCard("Amazon Web Services, Inc.","a subsidiary of Amazon that provides on-demand cloud computing platforms and APIs to individuals,","https://assets.intersystems.com/26/bd/6a6aa762425f87ad7d5c2fe65f8c/awslogo-image.jpg")}
          </div>
          <div className="carousel__cell number-slide2">
          {XCard("Microsoft Azure, Inc.","Microsoft Azure, often referred to as Azure, is a cloud computing platform run by Microsoft.","https://media.licdn.com/dms/image/D5612AQFNlURU9XPozg/article-cover_image-shrink_720_1280/0/1690582480376?e=2147483647&v=beta&t=ucmluwd5D1v3vZtRRNNS5dRADTqVyqWjw0qZe9b9-Ew")}

          </div>
          <div className="carousel__cell number-slide3">
            {XCard("Google Cloud Platform","Google Cloud Platform, offered by Google, is a suite of cloud computing services","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8cbaCdab7xdqZ7qpN-MwXg0ccikGFjuRKFz6sQyouow&s")}
          </div>
          <div className="carousel__cell number-slide4">
            {XCard("Coming Soon..","Cloud Provider Inc.","https://www.onlogic.com/company/io-hub/wp-content/uploads/2021/11/Cloud-header-image-770X421.jpg")}
          </div>
          
        </div>
      </div>
    </div>
  )
}
