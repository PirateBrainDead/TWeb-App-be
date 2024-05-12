import { defaultConfig } from './config';

export type Config = typeof defaultConfig;
export type AppConfig = typeof defaultConfig.app;
export type RedisConfig = typeof defaultConfig.redis;
export type JwtConfig = typeof defaultConfig.jwt;
