import sharp from 'sharp';
import path from 'path';

enum ImageFormate {
  PNG = 'png',
  JPG = 'jpg',
  JPEG = 'jpeg',
  WEBP = 'webp',
}

export const compressImage = async (image: Express.Multer.File): Promise<Buffer> => {
  const formate = getExtionsion(image.filename);
  const sh = sharp(image.buffer);
  switch (formate) {
    case ImageFormate.PNG:
      sh.png({ quality: 60 });
    case ImageFormate.JPG || ImageFormate.JPEG:
      sh.jpeg({ quality: 60 });
    case ImageFormate.WEBP:
      sh.webp({ quality: 70 });
  }
  return await sh.toBuffer();
};

const getExtionsion = (fileName: string) => {
  return path
    .extname(fileName || '')
    .split('.')
    .pop();
};
