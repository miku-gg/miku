export const checkImageDimensionsAndType = (file: File, types = ['image/png'], width=256, height=256): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      resolve(img.width === width && img.height === height && (!types || types.includes(file.type)));
    };
  });
}