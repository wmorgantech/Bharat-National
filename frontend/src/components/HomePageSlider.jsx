import React, { useState, useEffect, useRef, useCallback } from "react";
 import driver from "../assets/driverinstall.avif";
 import computer from "../assets/computer.avif";
  import server from "../assets/server.jpeg";

const slides = [
  {
    url: computer,
   
  },
  {
    url: driver,
   
  },
  {
    url:server,
   
  },
];

export default function HomePageSlider() {
  const autoPlayInterval = 5000;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const slideCount = slides.length;
  const timerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
  }, [slideCount]);

  useEffect(() => {
    timerRef.current = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timerRef.current);
  }, [nextSlide]);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) nextSlide();
    if (distance < -minSwipeDistance)
      setCurrentIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  return (
    <div
      className="relative w-full 
h-[55vh]         
sm:h-[60vh]      
md:h-[65vh]     
lg:h-[70vh]       
xl:h-[75vh]      
overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-full relative flex-shrink-0">
            <img src={slide.url} className="w-full h-full object-cover" />

            {/* Fade gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            {/* 3D POP-IN TEXT */}
            
          </div>
        ))}
      </div>

      {/* Indicator Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
