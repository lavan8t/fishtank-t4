"use client";
import { useRef } from 'react';

export const useDirectionalHover = () => {
  const ref = useRef(null);
  
  const onMouseMove = (e) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ref.current.style.setProperty('--x', `${x}px`);
    ref.current.style.setProperty('--y', `${y}px`);
  };

  return { ref, onMouseMove };
};