import { latlng2pixel } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
const CANVAS_SIZE = 80;

const ImageCrop = ({ imageUrl, polygon }) => {
  const canvasRef = useRef(null);

  function getBoundingBox(polygon) {
    const xList = polygon.map((item) => item[0]);
    const yList = polygon.map((item) => item[1]);
    const minX = Math.min(...xList);
    const maxX = Math.max(...xList);
    const minY = Math.min(...yList);
    const maxY = Math.max(...yList);
    return { minX, minY, maxX, maxY };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = imageUrl;

    image.onload = () => {
      const boundingBox = getBoundingBox(polygon);
      const sWidth = boundingBox.maxX - boundingBox.minX;
      const sHeight = boundingBox.maxY - boundingBox.minY;

      ctx.drawImage(
        image,
        boundingBox.minX,
        boundingBox.minY,
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
  }, [polygon]);

  return (
    <>
      <div style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ opacity: 1 }}
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

export default ImageCrop;
