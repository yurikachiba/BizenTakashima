const BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://bizen-takashima-api.onrender.com';

export const SOHEI_API = {
  BASE_URL,
  getUrl(path) {
    return this.BASE_URL + path;
  },
};
