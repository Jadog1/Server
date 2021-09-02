const database = require('./database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//User handling

exports.getUser = async (username) => {
    try {
        const query = await database.query({ text: "select contact_id from users where username=$1", values: [username], rowMode: "array" });
        return query[0].contact_id;
    } catch (e) {
        throw e;
    }
}

exports.verifyUser = async (username, password) => {
    try {
        const query = await database.query({ text: "select password from users where username=$1", values: [username], rowMode: "array" });
        if (query.length == 0)
            return false;
        return await bcrypt.compare(password, query[0].password);
    } catch (e) {
        throw e;
    }
}

exports.addUser = async (username, password) => {
    try {
        const hasher = await bcrypt.hash(password, saltRounds);
        await database.execute({ text: "insert into users(username,password) values ($1, $2)", values: [username, hasher], rowMode: "array" });
    } catch (e) {
        throw e;
    }
}

//Budget handling
exports.addBudget = async (salary, account_name, contact_id, tax_rate) => {
    try {
        return await database.execute({ text: "insert into budget (salary, account_name, contact_id, tax_rate) values ($1, $2, $3, $4)", values: [salary, account_name, contact_id, tax_rate], rowMode: "array" });
    } catch (e) {
        throw e;
    }
}

exports.deleteBudget = async (account_id) => {
    try {
        return await database.execute([{ text: "DELETE from expense where budget_id=$1", values: [account_id], rowMode: "array" }, { text: "DELETE from goal where budget_id=$1", values: [account_id], rowMode: "array" }, { text: "DELETE from budget where account_id=$1", values: [account_id], rowMode: "array" }]);
    } catch (e) {
        throw e;
    }
}

exports.getBudgetByUser = async (contact_id) => {
    try {
        return await database.query({ text: "select b.account_id, b.salary, b.account_name, b.tax_rate from budget b where b.contact_id = $1", values: [contact_id], rowMode: "array" });
    } catch (e) {
        throw e;
    }
}

exports.updateTaxRate = async (account_id, tax_rate) => {
    try {
        return await database.execute({ text: "update budget set tax_rate=$1 where account_id=$2", values: [tax_rate, account_id], rowMode: "array" });
    } catch (e) {
        throw e;
    }
}

//Expense/goal handling
exports.addExpense = async (amount, expense_name, budget_id) => {
    try {
        return await database.execute({ text: "insert into expense (amount, expense_name, budget_id) values ($1, $2, $3)", values: [amount, expense_name, budget_id], rowMode: "array" });
    } catch (e) {
        throw e;
    }
}

exports.getExpenseByBudget = async (budget_id) => {
    try {
        return await database.query({ text: "select e.expense_id, e.amount, e.expense_name, e.budget_id from expense e where e.budget_id =$1", values: [budget_id], rowMode: "array" });
    } catch (e) {
        throw e;
    }
}

exports.getOnlyExpenseByBudget = async (budget_id) => {
    try {
        return await database.query({ text: "select e.expense_id, e.amount, e.expense_name, e.budget_id from only expense e where e.budget_id =$1", values: [budget_id], rowMode: "array" });
    } catch (e) {
        throw e;
    }
}

exports.deleteExpense = async (expenseId) => {
    try {
        return await database.execute({ text: "DELETE from Expense where expense_id=$1", values: [expenseId], rowMode: "array" });
    } catch (e) {
        throw e;
    }
}

exports.addGoal = async (amount, expense_name, budget_id, expiration_date, optional, amount_paid) => {
    try {
        return await database.execute({text: "insert into goal (amount, expense_name, budget_id, expiration_date, optional, amount_paid)"
            + "values($1, $2, $3, $4, $5, $6)", values: [amount, expense_name, budget_id, expiration_date, optional, amount_paid], rowMode: "array"
        });
    } catch (e) {
        throw e;
    }
}

exports.getGoalByBudget = async (budget_id) => {
    try {
        return await database.query({ text: "select expense_id, budget_id, amount, expense_name, expiration_date, optional, amount_paid from goal where budget_id =$1", values: [budget_id], rowMode: "array" });
    } catch (e) {
        throw e;
    }
}

//Start home server parsing of data
exports.getHomeServerData = async () => {
    try {
        return await database.query("select * from home_server");
    } catch (e) {
        throw e;
    }
}

exports.addHomeServerData = async (json_data) => {
    try {
        return await database.execute({ text: "insert into home_server (json_data) values ($1)", values: [json_data], rowMode: "array" });
    } catch (e) {
        throw e;
    }
}

exports.deleteHomeServerData = async () => {
    try {
        return await database.execute("DELETE from home_server");
    } catch (e) {
        throw e;
    }
}