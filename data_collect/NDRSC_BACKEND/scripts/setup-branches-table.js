require('dotenv').config();
const mysql = require('mysql2/promise');

const checkAndCreateBranchesTable = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database');

        // Check if branches table exists
        const [tables] = await connection.execute(
            "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'branches'",
            [process.env.DB_NAME]
        );

        if (tables.length === 0) {
            console.log('Creating branches table...');
            await connection.execute(`
                CREATE TABLE branches (
                    bank_name VARCHAR(255) NOT NULL,
                    branch_name VARCHAR(255) NOT NULL,
                    PRIMARY KEY (bank_name, branch_name)
                )
            `);
            console.log('✓ Branches table created');
        } else {
            console.log('✓ Branches table already exists');
            
            // Check columns
            const [columns] = await connection.execute(
                "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'branches'",
                [process.env.DB_NAME]
            );
            console.log('Existing columns:', columns.map(c => c.COLUMN_NAME));
        }

        // Check if table has data
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM branches');
        const count = rows[0].count;
        
        if (count === 0) {
            console.log('\nInserting test data...');
            const testBranches = [
                ['Bank of Ceylon', 'Colombo Main'],
                ['Bank of Ceylon', 'Kandy Branch'],
                ['Bank of Ceylon', 'Galle Branch'],
                ['Commercial Bank', 'Colombo Fort'],
                ['Commercial Bank', 'Matara Branch'],
                ['Sampath Bank', 'Colombo Center'],
                ['Sampath Bank', 'Jaffna Branch'],
                ['Seylan Bank', 'Colombo City'],
                ['Seylan Bank', 'Negombo Branch'],
                ['NTB - National Thrift Bank', 'Colombo Main'],
                ['Pan Asia Bank', 'Colombo'],
                ['DFCC Bank', 'Colombo Head Office']
            ];

            for (const [bank, branch] of testBranches) {
                await connection.execute(
                    'INSERT INTO branches (bank_name, branch_name) VALUES (?, ?)',
                    [bank, branch]
                );
            }
            console.log(`✓ Inserted ${testBranches.length} test branches`);
        } else {
            console.log(`✓ Table already has ${count} branches`);
        }

        // Display all branches
        const [allBranches] = await connection.execute('SELECT * FROM branches');
        console.log('\n=== Current Branches ===');
        allBranches.forEach(b => {
            console.log(`  ${b.bank_name} - ${b.branch_name}`);
        });

        await connection.end();
        console.log('\n✓ Done!');
        process.exit(0);

    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    }
};

checkAndCreateBranchesTable();
