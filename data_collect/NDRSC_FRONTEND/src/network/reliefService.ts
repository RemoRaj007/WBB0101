import { dispatch } from './dispatch';

export const createReliefRequest = async (data: any) => {
    const formData = new FormData();

    // Append all text fields
    Object.keys(data).forEach(key => {
        if (key !== 'evidence') {
            formData.append(key, data[key]);
        }
    });

    // Append files
    if (data.evidence && data.evidence.length > 0) {
        data.evidence.forEach((file: File) => {
            formData.append('evidence', file);
        });
    }

    return await dispatch.post('/relief-requests', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getReliefRequests = async (status?: string) => {
    const url = status ? `/relief-requests?status=${status}` : '/relief-requests';
    return await dispatch.get(url);
};

export const getReliefRequestById = async (id: number) => {
    return await dispatch.get(`/relief-requests/${id}`);
};

export const updateReliefRequestStatus = async (id: number, status: string, remarks?: string) => {
    return await dispatch.put(`/relief-requests/${id}/status`, { status, remarks });
};

export const assignVolunteer = async (requestId: number, volunteerId: number) => {
    return await dispatch.put(`/relief-requests/${requestId}/assign`, { volunteerId });
};

export const getDistrictStats = async () => {
    return await dispatch.get('/relief-requests/stats/district');
};
