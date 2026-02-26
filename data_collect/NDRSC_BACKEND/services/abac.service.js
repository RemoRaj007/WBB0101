const { ABACPolicy } = require('../models');

class AbacService {
    async createPolicy(policyData) {
        return await ABACPolicy.create(policyData);
    }

    async getAllPolicies() {
        return await ABACPolicy.findAll({
            where: { status: 'active' },
            order: [['priority', 'DESC']]
        });
    }

    async updatePolicy(id, policyData) {
        const [updated] = await ABACPolicy.update(policyData, {
            where: { id }
        });

        if (updated) {
            return await ABACPolicy.findByPk(id);
        }
        throw new Error('Policy not found');
    }

    async deletePolicy(id) {
        const policy = await ABACPolicy.findByPk(id);

        if (!policy) {
            throw new Error('Policy not found');
        }

        await policy.update({ status: 'inactive' });
        return true;
    }


}

module.exports = new AbacService();
