import React from 'react';
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PrevArrow = ({ onClick }) => (
  <div onClick={onClick} style={{
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
    left: '16px', width: '44px', height: '44px',
    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'white', fontSize: '18px', transition: 'all 0.2s'
  }}>
    <FaChevronLeft />
  </div>
);

const NextArrow = ({ onClick }) => (
  <div onClick={onClick} style={{
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
    right: '16px', width: '44px', height: '44px',
    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'white', fontSize: '18px', transition: 'all 0.2s'
  }}>
    <FaChevronRight />
  </div>
);

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
};

const slides = ['/img/slider1.webp', '/img/slider2.webp', '/img/slider3.webp', '/img/slider4.webp', '/img/slider5.webp'];

export default function HeroSlider() {
  return (
    <div className="cp-slider-wrap">
      <Slider {...sliderSettings}>
        {slides.map((img, i) => (
          <div key={i}>
            <img src={img} alt={`Slide ${i + 1}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
}
