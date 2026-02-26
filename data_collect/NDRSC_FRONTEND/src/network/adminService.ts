import { dispatch } from './dispatch';

export const getPolicies = async () => {
    return await dispatch.get('/abac');
};
