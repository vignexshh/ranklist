'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Box, Typography, Paper } from '@mui/material';

// Sample image list
const images = [
  {
    label: 'San Francisco – Golden Gate Bridge',
    imgPath: '/image.png',
  },
  {
    label: 'New York – Skyline',
    imgPath: 'https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8MTYlM0E5fGVufDB8fDB8fHww',
  },
  {
    label: 'Paris – Eiffel Tower',
    imgPath: 'https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8MTYlM0E5fGVufDB8fDB8fHww',
  },
];

export default function AutoImageCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <Box sx={{  mx: 'auto', pt: 2 }}>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ 
          clickable: true,
          dynamicBullets: true
        }}
        modules={[Autoplay, Pagination]}
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        className="mySwiper"
        style={{ 
          borderRadius: '16px', 
          overflow: 'hidden',
          width: '100%',
          height: '150px'
        }}
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={img.imgPath}
              alt={img.label}
              onError={(e) => {
                console.error('Image failed to load:', img.imgPath);
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x350/cccccc/666666?text=Image+Not+Found';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', img.imgPath);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}