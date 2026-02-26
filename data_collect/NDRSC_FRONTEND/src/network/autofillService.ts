import { dispatch } from './dispatch';

export interface AutofillData {
    name: string;
    nic: string;
    address: string;
    phone: string;
    gnDivision: string;
    dsDivision: string;
    district: string;
}

export const getAutofillData = async (nic: string) => {
    return await dispatch.get(`/autofill?nic=${nic}`);
};
