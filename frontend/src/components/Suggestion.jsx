import React, { useRef, useEffect, useState } from 'react';
import './Suggestion.css';

function Suggestion() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState({
    img1: false,
    img2: false,
    img3: false,
    img4: false
  });

  useEffect(() => {
    // Create intersection observer with improved options for smoother triggering
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        // Use a more precise threshold and only trigger when significantly in view
        if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
          setVisible(true);
          // Once triggered, disconnect to prevent re-triggering
          observer.disconnect();
        }
      },
      { 
        threshold: [0.15, 0.3, 0.5], 
        rootMargin: "0px 0px -50px 0px" 
      }
    );
    
    if (sectionRef.current) observer.observe(sectionRef.current);
    
    // Check if all images are preloaded
    const checkImagesLoaded = () => {
      // Check if all images in the status object are loaded
      const allLoaded = Object.values(imageLoadStatus).every(status => status === true);
      if (allLoaded) {
        setImagesLoaded(true);
      }
    };
    
    // Check if images are already cached
    const images = document.querySelectorAll('.suggestion-item img');
    let initialLoadCount = 0;
    
    images.forEach(img => {
      if (img.complete && img.naturalHeight !== 0) {
        initialLoadCount++;
      }
    });
    
    // If all images are immediately available, set as loaded
    if (initialLoadCount === images.length) {
      setImagesLoaded(true);
    }
    
    // Fallback to ensure animation happens even if image load events don't fire
    const timeoutId = setTimeout(() => {
      checkImagesLoaded();
    }, 1000);
    
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [imageLoadStatus]);

  return (
    <div
      className={`suggestion-grid${visible ? ' suggestion-visible' : ''}${imagesLoaded ? ' images-loaded' : ''}`}
      ref={sectionRef}
    >
      <div className="suggestion-item item-large">
        <img 
          src="/images/suggestion1.jpg" 
          alt="Outfit" 
          onLoad={(e) => e.target.classList.add('loaded')}
          onError={(e) => {
            console.error('Failed to load image:', e.target.src);
            e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
          }}
        />
      </div>
      <div className="suggestion-item item-top-right">
        <img 
          src="/images/suggestion2.jpg" 
          alt="Shoes" 
          onLoad={(e) => e.target.classList.add('loaded')}
          onError={(e) => {
            console.error('Failed to load image:', e.target.src);
            e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
          }}
        />
      </div>
      <div className="suggestion-item item-middle">
        <img 
          src="/images/suggestion3.jpg" 
          alt="Ring" 
          onLoad={(e) => e.target.classList.add('loaded')}
          onError={(e) => {
            console.error('Failed to load image:', e.target.src);
            e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
          }}
        />
      </div>
      <div className="suggestion-item item-bottom-right">
        <img 
          src="/images/suggestion4.jpg" 
          alt="Bag" 
          onLoad={(e) => e.target.classList.add('loaded')}
          onError={(e) => {
            console.error('Failed to load image:', e.target.src);
            e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
          }}
        />
      </div>
    </div>
  );
}

export default Suggestion;
