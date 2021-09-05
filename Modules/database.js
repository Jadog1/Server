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
            client.end();
            if (err)
                reject(err);
            else
                resolve(res.rows);
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
        await client.query('BEGIN');
        for (i = 0; i < transactions.length; i++)
            await client.query(transactions[i]);

        await client.query('COMMIT');
    } catch (e) {
        client.query('ROLLBACK');
        throw e;
    } finally {
        client.end();
    }
} 