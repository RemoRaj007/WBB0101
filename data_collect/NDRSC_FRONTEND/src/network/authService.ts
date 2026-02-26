import { dispatch } from './dispatch';

export const login = async (credentials: { username: string; password: string }) => {
    return await dispatch.post('/auth/login', credentials);
};

export const registerUnVolunteer = async (data: any) => {
    return await dispatch.post('/auth/register/un-volunteer', data);
};
