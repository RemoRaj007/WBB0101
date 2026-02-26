require('dotenv').config();
const db = require('../models');

const seedBranches = async () => {
    try {
        // First, check if table exists by attempting to sync
        console.log('Syncing database...');
        await db.sequelize.sync();

        console.log('Checking for existing branches...');
        const existingCount = await db.Branch.count();
        
        if (existingCount > 0) {
            console.log(`✓ Branches table already has ${existingCount} records`);
            return;
        }

        console.log('Creating test branches...');
        
        const testBranches = [
            { bank_name: 'Bank of Ceylon', branch_name: 'Colombo Main' },
            { bank_name: 'Bank of Ceylon', branch_name: 'Kandy Branch' },
            { bank_name: 'Bank of Ceylon', branch_name: 'Galle Branch' },
            { bank_name: 'Commercial Bank', branch_name: 'Colombo Fort' },
            { bank_name: 'Commercial Bank', branch_name: 'Matara Branch' },
            { bank_name: 'Sampath Bank', branch_name: 'Colombo Center' },
            { bank_name: 'Sampath Bank', branch_name: 'Jaffna Branch' },
            { bank_name: 'Seylan Bank', branch_name: 'Colombo City' },
            { bank_name: 'Seylan Bank', branch_name: 'Negombo Branch' },
            { bank_name: 'NTB - National Thrift Bank', branch_name: 'Colombo Main' },
            { bank_name: 'Pan Asia Bank', branch_name: 'Colombo' },
            { bank_name: 'DFCC Bank', branch_name: 'Colombo Head Office' }
        ];

        const created = await db.Branch.bulkCreate(testBranches);
        console.log(`✓ Successfully created ${created.length} branch records`);
        
        // Verify
        const count = await db.Branch.count();
        console.log(`✓ Total branches in database: ${count}`);

    } catch (error) {
        console.error('✗ Error seeding branches:', error);
        process.exit(1);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
};

seedBranches();
