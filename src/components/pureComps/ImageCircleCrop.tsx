import React, { useEffect, useRef } from 'react';
const CANVAS_SIZE = 80;

const ImageCircleCrop = ({ imageUrl, centerX, centerY, radius }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = imageUrl;

    image.onload = () => {
      const sx = centerX - radius / 2;
      const sy = centerY - radius / 2;
      const sWidth = radius;
      const sHeight = radius;

      ctx.drawImage(
        image,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        CANVAS_SIZE,
        CANVAS_SIZE
      );
      ctx.globalCompositeOperation = 'destination-in';

      ctx.arc(
        CANVAS_SIZE / 2,
        CANVAS_SIZE / 2,
        CANVAS_SIZE / 2,
        0,
        2 * Math.PI
      );

      ctx.fillStyle = 'white';
      ctx.fill();
    };
  }, [imageUrl, centerX, centerY, radius]);

  return (
    <>
      <div style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ opacity: 0.7 }}
        />
        <div style={{ position: 'relative', top: -CANVAS_SIZE }}>
          <svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
            <circle
              strokeDasharray={'5 3'}
              cx={CANVAS_SIZE / 2}
              cy={CANVAS_SIZE / 2}
              r={CANVAS_SIZE / 2 - 1}
              stroke="black"
              strokeWidth={2}
              fill="none"
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default ImageCircleCrop;
