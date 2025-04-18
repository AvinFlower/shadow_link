import React, { useEffect, useState } from 'react';

type MatrixBackgroundProps = {
  children: React.ReactNode;
};

type MatrixCharacter = {
  key: number;
  char: string;
  x: number;
  delay: number;
  speed: number;
  opacity: number;
};

const MatrixBackground: React.FC<MatrixBackgroundProps> = ({ children }) => {
  const [matrixChars, setMatrixChars] = useState<MatrixCharacter[]>([]);
  
  useEffect(() => {
    // Matrix characters (including some cybersecurity symbols)
    const possibleChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン∞§¥$£€πΦΨΩλθ∆∇{}[]<>|~%#@!?';
    
    // Create initial matrix characters for the background
    const totalChars = Math.floor(window.innerWidth / 20); // Adjust spacing
    const initialChars: MatrixCharacter[] = [];
    
    for (let i = 0; i < totalChars; i++) {
      initialChars.push({
        key: i,
        char: possibleChars.charAt(Math.floor(Math.random() * possibleChars.length)),
        x: Math.random() * 100, // Position horizontally (percentage)
        delay: Math.random() * 5, // Random delay
        speed: 2 + Math.random() * 3, // Random speed
        opacity: 0.3 + Math.random() * 0.7, // Random opacity
      });
    }
    
    setMatrixChars(initialChars);
    
    // Change characters periodically
    const intervalId = setInterval(() => {
      setMatrixChars(prevChars => 
        prevChars.map(char => ({
          ...char,
          char: Math.random() > 0.8 
            ? possibleChars.charAt(Math.floor(Math.random() * possibleChars.length)) 
            : char.char
        }))
      );
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Matrix rain effect */}
      <div className="fixed inset-0 z-0">
        {matrixChars.map((item) => (
          <div
            key={item.key}
            className="absolute animate-matrix"
            style={{
              left: `${item.x}%`,
              animationDelay: `${item.delay}s`,
              animationDuration: `${item.speed}s`,
              opacity: item.opacity,
              color: '#00ff41',
              textShadow: '0 0 8px #00ff41',
              fontSize: '1.2rem',
              fontFamily: 'monospace'
            }}
          >
            {item.char}
          </div>
        ))}
      </div>
      
      {/* Overlay gradient for better readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"></div>
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MatrixBackground;