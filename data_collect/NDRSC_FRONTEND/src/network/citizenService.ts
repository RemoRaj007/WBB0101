import { dispatch } from './dispatch';

export interface CitizenData {
    name: string;
    nic: string;
    address: string;
    phone: string;
    gnDivision: string;
    dsDivision: string;
    district: string;
}

export const registerCitizen = async (formData: CitizenData, file: File | null) => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
    });

    if (file) {
        data.append('scannedFormImage', file);
    }

    const response = await dispatch.post('/citizens', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

export const getCitizens = async (status?: string) => {
    const url = status ? `/citizens?status=${status}` : '/citizens';
    return await dispatch.get(url);
};

export const getCitizenByNic = async (nic: string) => {
    return await dispatch.get(`/citizens?nic=${nic}`);
};

export const updateCitizenStatus = async (id: number, status: string, remarks?: string) => {
    return await dispatch.put(`/citizens/${id}/status`, { status, remarks });
};
