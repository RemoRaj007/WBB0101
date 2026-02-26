import { dispatch } from './dispatch';

export const updateProfile = async (data: FormData) => {
    return await dispatch.put('/users/me', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getPendingVolunteers = async () => {
    return await dispatch.get('/users/volunteers/pending');
};

export const getActiveVolunteers = async () => {
    return await dispatch.get('/users/volunteers/active');
};

export const updateVolunteerStatus = async (id: number, status: string, district?: string) => {
    return await dispatch.put(`/users/volunteers/${id}/approve`, { status, district });
};

export const getUsers = async () => {
    return await dispatch.get('/users');
};
