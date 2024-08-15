import React, { useRef, useEffect } from 'react';

function InteractiveMap() {
  const canvasRef = useRef(null);
  const offScreenCanvasRef = useRef(document.createElement('canvas')); // Create an off-screen canvas
  const maskImageRef = useRef(new Image());

  useEffect(() => {
    // eslint-disable-next-line
    // @ts-ignore
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const offScreenCanvas = offScreenCanvasRef.current;
    const offScreenCtx = offScreenCanvas.getContext('2d');
    const maskImage = maskImageRef.current;
    maskImage.src = '/map/map_mask1.jpg';

    maskImage.onload = () => {
      // Set the off-screen canvas size
      offScreenCanvas.width = maskImage.width;
      offScreenCanvas.height = maskImage.height;
      // Draw the mask on the off-screen canvas
      offScreenCtx?.drawImage(maskImage, 0, 0);
      ctx.drawImage(maskImage, 0, 0);
      canvas.style.opacity = '0.1';
    };

    canvas.width = window.innerWidth; // Or set to the size of your map image if it's not full window
    canvas.height = window.innerHeight;

    // Function to check if the pixel is white
    const isWhitePixel = (data: Uint8ClampedArray) => {
      const tolerance = 10; // Tolerance for what is considered "white"
      return data[0] > 255 - tolerance && data[1] > 255 - tolerance && data[2] > 255 - tolerance;
    };

    canvas.addEventListener('mousemove', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      // Use the off-screen canvas for pixel detection
      const pixel = offScreenCtx?.getImageData(x, y, 1, 1).data;
      if (pixel && isWhitePixel(pixel)) {
        canvas.style.cursor = 'pointer';
        canvas.style.opacity = '0.6';
        canvas.style.filter = 'blur(5px)';
        // increase brightnest on the white area
      } else {
        canvas.style.cursor = 'default';
        canvas.style.opacity = '0.1';
      }
    });

    // Resize handler if the window size changes or if it needs to be dynamic
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Optionally redraw any persistent highlight effects
    });
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <img src="/map/map.jpg" alt="Map" />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'all .2s ease-out',
        }}
      ></canvas>
    </div>
  );
}

export default InteractiveMap;
