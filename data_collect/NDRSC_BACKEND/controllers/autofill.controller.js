const logger = require('../utils/logger');
const axios = require('axios');

exports.getByNic = async (req, res) => {
    try {
        const { nic } = req.query;

        if (!nic) {
            return res.status(400).json({ message: 'NIC is required' });
        }

        const apiUrl = process.env.NDRSC_API_URL;
        const apiUsername = process.env.NDRSC_USERNAME;
        const apiPassword = process.env.NDRSC_PASSWORD;

        if (!apiUrl || !apiUsername || !apiPassword) {
            logger.error('NDRSC credentials/URL not defined in .env');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        try {
            const loginResponse = await axios.post(`${apiUrl}/Auth/login`, {
                username: apiUsername,
                password: apiPassword
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const token = loginResponse.data?.token?.accessToken;
            if (!token) {
                logger.error('Failed to retrieve token from external API');
                return res.status(502).json({ message: 'External authentication failed' });
            }

            // 2. Fetch details using token
            const response = await axios.post(`${apiUrl}/Disasters/get-Details-Sample?nic=${encodeURIComponent(nic)}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                }
            });

            const data = response.data;

            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'Citizen not found in external system' });
            }

           
            const household = Array.isArray(data) ? data[0] : data;

            const citizen = {
                name: household.applicant_name,
                nic: household.applicant_NIC,
                phone: household.applicant_Phone,
                address: household.address,
                gnDivision: household.gramaNiladari_VM?.gnName || '',
                dsDivision: '',
                district: ''
            };

            res.status(200).json(citizen);

        } catch (apiError) {
            if (axios.isAxiosError(apiError)) {
                if (apiError.response && apiError.response.status === 404) {
                    return res.status(404).json({ message: 'Citizen not found in external system' });
                }
                logger.error('External API Error: ' + apiError.message);
                return res.status(502).json({ message: 'Failed to fetch data from external system' });
            }
            throw apiError;
        }

    } catch (error) {
        logger.error('Autofill Error: ' + error.message);
        res.status(500).json({ message: 'Failed to autofill data' });
    }
};
