import React from 'react';

const AviatorLogo = ({ size = 64 }) => {
  return (
    <div 
      style={{
        width: size,
        height: size,
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #5C0D83 0%, #FF2A7D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      <svg 
        width={size * 0.6} 
        height={size * 0.6} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 2L21 9L12 12L3 9L12 2Z" 
          fill="white"
        />
        <path 
          d="M12 12V22" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M8 15L12 12L16 15" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M7 10L3 9L5 13" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M17 10L21 9L19 13" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default AviatorLogo;