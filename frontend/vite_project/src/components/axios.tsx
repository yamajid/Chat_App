

import axios from 'axios'
import Cookies from 'js-cookie'

const axiosInstance = axios.create({
    baseURL : 'http://localhost:8000',
    headers : {
        'Content-Type' : 'application/json',
    },
    withCredentials:true,
})

export default axiosInstance;

axiosInstance.interceptors.request.use(
  config => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    else{
          console.log("not token provided")
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);



export  async function refreshAuthToken() {
  try {
    const response = await axiosInstance.post(`/api/user/refresh`);
    if (response.status !== 200)
      throw Error
    axiosInstance.defaults.headers['Authorization'] = `Bearer ${Cookies.get('access_token')}`;
  } catch (error) {
    // toast.error(error?.response?.data?.error ?? "You are not authorized.");
    throw Error("401");
  }
}