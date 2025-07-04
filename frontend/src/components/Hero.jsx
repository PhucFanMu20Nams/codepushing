import React, { useRef, useEffect, useState } from 'react';
import './Hero.css';

function Hero() {
  const videoRef = useRef(null);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrame;

    const playReverse = () => {
      if (video.currentTime > 0) {
        video.currentTime -= 0.04;
        animationFrame = requestAnimationFrame(playReverse);
      } else {
        setReverse(false);
        video.play();
      }
    };

    const handleEnded = () => {
      setReverse(true);
      playReverse();
    };

    if (reverse) {
      playReverse();
    } else {
      video.addEventListener('ended', handleEnded);
    }

    return () => {
      video.removeEventListener('ended', handleEnded);
      cancelAnimationFrame(animationFrame);
    };
  }, [reverse]);

  return (
    <section className="hero">
      <video
        className="hero-bg-video"
        ref={videoRef}
        src="/assets/images/background.mp4"
        autoPlay
        loop={false}
        muted
        playsInline
      />
      <div className="hero-content">
        <h1 className="hero-title">TEXTURA</h1>
        <p className="hero-subtitle">Not Just Worn. Experienced.</p>
        <button className="shop-now-btn">SHOP NOW</button>
      </div>
    </section>
  );
}

export default Hero;