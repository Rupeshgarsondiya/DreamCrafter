import { useState, useEffect } from 'react';

const useFloatingElements = (count = 15) => {
  const [floatingElements, setFloatingElements] = useState([]);

  useEffect(() => {
    const elements = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 2 + 1,
      type: ['cloud', 'star', 'sparkle'][Math.floor(Math.random() * 3)],
      delay: Math.random() * 2,
      opacity: Math.random() * 0.4 + 0.1
    }));
    setFloatingElements(elements);
  }, [count]);

  return floatingElements;
};

export default useFloatingElements;