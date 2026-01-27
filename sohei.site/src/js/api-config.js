const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
const BASE_URL = isLocal
  ? 'http://localhost:3001'
  : 'https://bizen-takashima-api.onrender.com';

export const SOHEI_API = {
  BASE_URL,
  getUrl(path) {
    return this.BASE_URL + path;
  },
};
