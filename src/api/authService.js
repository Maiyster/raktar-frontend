import { axiosPublic } from './axios';

export const loginUser = async (credentials) => {
    const response = await axiosPublic.post('user/login', credentials);
    
    if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};