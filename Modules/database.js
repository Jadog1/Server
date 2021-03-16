const { Pool, Client } = require('pg');

exports.query = (query) => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    return new Promise((resolve, reject) => {
        client.connect();

        client.query(query, (err, res) => {
            if (err) {
                client.end();
                reject(err);
            }
            resolve(res.rows);
            client.end();
        });
    });
}

exports.execute = async (transactions) => {
    if (transactions.constructor !== Array) //If not in array, then put in array
        transactions = [transactions];

    const client = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

        await client.connect();
        try {
            for (i = 0; i < transactions.length; i++) {
                await client.query('BEGIN');
                await client.query(transactions[i]);
            }

            await client.query('COMMIT');
        } catch (e) {
            client.query('ROLLBACK');
            throw e;
        } finally {
            client.end();
        }
} 