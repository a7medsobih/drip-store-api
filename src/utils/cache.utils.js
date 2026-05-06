import NodeCache from "node-cache";

const cache = new NodeCache();

export const setCache = (key, value, ttl) => {
  return cache.set(key, value, ttl);
};

export const getCache = (key) => {
  return cache.get(key);
};

export const deleteCache = (key) => {
  return cache.del(key);
};

export default cache;
