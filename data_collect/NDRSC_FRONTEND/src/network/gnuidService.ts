import { dispatch } from './dispatch';

export interface GNUIDData {
    oldName: string;
    district: string;
    dsDivision: string;
    gnDivision: string;
    gnNumber: string;
    gnUid: string;
}

export const searchGnuid = async (query: string): Promise<GNUIDData[]> => {
    if (!query || query.length < 2) return [];
    const response = await dispatch.get(`/gnuid/search?query=${query}`);
    return response.data || [];
};
