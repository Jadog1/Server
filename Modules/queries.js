const database = require('./database');
const bcrypt = require('bcrypt');
const saltRounds = 10;


exports.getUsers = async () => {
    try {
        const query = await database.query("select * from users");
        return query;
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

exports.verifyUser = async (username, password) => {
    try {
        const query = await database.query("select password from users where username='" + username + "'");
        return await bcrypt.compare(password, query[0].password);
    } catch (e) {
        throw e;
    }
}