import { dispatch } from './dispatch';

export const downloadReport = async (reportType: 'relief' | 'citizens', format: 'excel' | 'pdf') => {
    try {
        const endpoint = `/reports/${reportType}/${format}`;
        const response = await dispatch.get(endpoint, {
            responseType: 'blob'
        });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        link.setAttribute('download', filename);

        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(`Failed to download ${reportType} ${format} report:`, error);
        throw error;
    }
};
