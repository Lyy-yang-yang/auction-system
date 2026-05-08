// 内存缓存（完全替代 Redis）
const memoryCache = new Map<string, string>();

export const redisGet = async (key: string): Promise<string | null> => {
  return memoryCache.get(key) || null;
};

export const redisSet = async (key: string, value: string, mode?: string, time?: number): Promise<boolean> => {
  memoryCache.set(key, value);
  // 设置过期
  if (time) {
    setTimeout(() => memoryCache.delete(key), time * 1000);
  }
  return true;
};

export const redisDel = async (key: string): Promise<number> => {
  return memoryCache.delete(key) ? 1 : 0;
};

export const redisEval = async (script: string, numKeys: number, ...args: any[]): Promise<any> => {
  // 内存模式下的简化实现
  const key = args[0];
  const bidAmount = parseFloat(args[1]);
  const current = memoryCache.get(key);
  if (!current || parseFloat(current) < bidAmount) {
    memoryCache.set(key, bidAmount.toString());
    return 1;
  }
  return 0;
};

export default null;