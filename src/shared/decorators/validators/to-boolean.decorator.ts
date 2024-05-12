import { Transform } from 'class-transformer';

export const ToBoolean = (): ((target: any, key: string) => void) => {
  return Transform(({ value }: any) => {
    return value === 'true' || value === true || value === 1 || value === '1';
  });
};
