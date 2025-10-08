import React from "react";

interface Props {
  value: number; // 0 ~ 100 사이의 값
}

const ProgressBar: React.FC<Props> = ({ value }) => {
  const progress = Math.max(0, Math.min(100, value)); // 0~100 사이로 값 고정

  return (
    <div style={{ width: '100%', background: '#e0e0e0', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          background: '#4f46e5',
          borderRadius: '8px',
          transition: 'width 0.3s ease-in-out',
        }}
      />
    </div>
  );
};

export default ProgressBar;