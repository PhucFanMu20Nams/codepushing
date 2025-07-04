import React, { useRef, useEffect, useState } from 'react';
import './Suggestion.css';

function Suggestion() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`suggestion-grid${visible ? ' suggestion-visible' : ''}`}
      ref={sectionRef}
    >
      <div className="suggestion-item item-large">
        <img src="/assets/images/suggestion1.jpg" alt="Outfit" />
      </div>
      <div className="suggestion-item item-top-right">
        <img src="/assets/images/suggestion2.jpg" alt="Shoes" />
      </div>
      <div className="suggestion-item item-middle">
        <img src="/assets/images/suggestion3.jpg" alt="Ring" />
      </div>
      <div className="suggestion-item item-bottom-right">
        <img src="/assets/images/suggestion4.jpg" alt="Bag" />
      </div>
    </div>
  );
}

export default Suggestion;
