import { dispatch } from './dispatch';

export const fetchBranches = async () => {
  try {
    const response = await dispatch.get('/branches');
    console.log('✅ Branches fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching branches:', error);
    console.error('📋 Error details:', error.response?.data);
    console.error('📋 Error message:', error.response?.data?.message);
    
    // Log the full error for debugging
    if (error.response?.data?.details) {
      console.error('📋 SQL/Details:', error.response.data.details);
    }
    throw error;
  }
};
