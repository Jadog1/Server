const database = require('./database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//User handling

exports.getUsers = async () => {
    try {
        const query = await database.query("select * from users");
        return query;
    } catch (e) {
        throw e;
    }
}

exports.verifyUser = async (username, password) => {
    try {
        const query = await database.query("select password from users where username='" + username + "'");
        return await bcrypt.compare(password, query[0].password);
    } catch (e) {
        throw e;
    }
}

exports.addUser = async (username, password) => {
    try {
        const hasher = await bcrypt.hash(password, saltRounds);
        await database.execute(["insert into users(username,password) values ('" + username + "', '" + hasher + "')"]);
    } catch (e) {
        throw e;
    }
}

//Budget handling
exports.addBudget = async (salary, account_name, contact_id) => {
    try {
        return await database.execute("insert into budget (salary, account_name, contact_id) values (" + salary + ", '" + account_name + "', '" + contact_id + "')");
    } catch (e) {
        throw e;
    }
}

exports.getBudgetByUser = async (contact_id) => {
    try {
        return await database.query("select b.account_id, b.salary, b.account_name from budget b where b.contact_id = '" + contact_id + "'");
    } catch (e) {
        throw e;
    }
}