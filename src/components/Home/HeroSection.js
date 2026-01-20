import React, { useEffect, useRef, useState } from "react";
import { message } from "antd";
import Slider from "react-slick";
import { bannerAPI } from "../../lib/api";
import "./HeroSection.css";
import website from "../../website/data";
import { HomeBannerSkeleton } from "../SkeletonLoader";

const HeroSection = () => {
  const arrowRef = useRef();
  const [banners, setBanners] = useState(null);

  var settings = {
    dots: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
  };

  async function getBanners() {
    try {
      const response = await bannerAPI.getBanners();
      const res = await response.json();
      if (res.success) {
        setBanners(res.data);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getBanners();
  }, []);

  return (
    <>
      {/* Desktop and Tablet  */}
      <div className="container-fluid hero-container">
        {!banners ? (
          <HomeBannerSkeleton />
        ) : (
          <Slider ref={arrowRef} {...settings}>
            {banners?.map((item, index) => {
              // Use image URL directly if it's already a full URL, otherwise prepend website.link
              const imageUrl = item?.image?.startsWith('http://') || item?.image?.startsWith('https://')
                ? item?.image
                : `${website.link}/${item?.image}`;

              return (
                <div key={index} className="banner">
                  <div className="image">
                    <img src={imageUrl} alt="banner" />
                  </div>
                </div>
              );
            })}
          </Slider>
        )}
      </div>
    </>
  );
};

export default HeroSection;
