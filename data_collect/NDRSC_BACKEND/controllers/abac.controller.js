const db = require('../models');
const ABACPolicy = db.ABACPolicy;

exports.createPolicy = async (req, res) => {
    try {
        const policy = await ABACPolicy.create(req.body);
        res.status(201).json(policy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllPolicies = async (req, res) => {
    try {
        const policies = await ABACPolicy.findAll();
        res.json(policies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePolicy = async (req, res) => {
    try {
        const id = req.params.id;
        await ABACPolicy.update(req.body, { where: { id: id } });
        res.json({ message: "Policy updated successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deletePolicy = async (req, res) => {
    try {
        const id = req.params.id;
        await ABACPolicy.destroy({ where: { id: id } });
        res.json({ message: "Policy deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
