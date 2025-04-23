

import axios from 'axios'
import Cookies from 'js-cookie'

const axiosInstance = axios.create({
    baseURL : 'http://localhost:8000',
    headers : {
        'Content-Type' : 'application/json',
    },
    withCredentials:true,
})


axiosInstance.interceptors.request.use(
  config => {
    const token = Cookies.get('access_token');
    if (token) {
        console.log(token)
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    else{
        console.log("nooooone")
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axiosInstance;