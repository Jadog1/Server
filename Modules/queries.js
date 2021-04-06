const database = require('./database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//User handling

exports.getUser = async (username) => {
    try {
        const query = await database.query("select contact_id from users where username='" + username +"'");
        return query[0].contact_id;
    } catch (e) {
        throw e;
    }
}

exports.verifyUser = async (username, password) => {
    try {
        const query = await database.query("select password from users where username='" + username + "'");
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
        await database.execute(["insert into users(username,password) values ('" + username + "', '" + hasher + "')"]);
    } catch (e) {
        throw e;
    }
}

//Budget handling
exports.addBudget = async (salary, account_name, contact_id, tax_rate) => {
    try {
        return await database.execute("insert into budget (salary, account_name, contact_id, tax_rate) values (" + salary + ", '" + account_name + "', '" + contact_id + "', " + tax_rate + ")");
    } catch (e) {
        throw e;
    }
}

exports.deleteBudget = async (account_id) => {
    try {
        return await database.execute(["DELETE from expense where budget_id=" + account_id + "", "DELETE from goal where budget_id=" + account_id + "", "DELETE from budget where account_id=" + account_id + ""]);
    } catch (e) {
        throw e;
    }
}

exports.getBudgetByUser = async (contact_id) => {
    try {
        return await database.query("select b.account_id, b.salary, b.account_name, b.tax_rate from budget b where b.contact_id = '" + contact_id + "'");
    } catch (e) {
        throw e;
    }
}

exports.updateTaxRate = async (account_id, tax_rate) => {
    try {
        return await database.execute("update budget set tax_rate=" + tax_rate + " where account_id=" + account_id);
    } catch (e) {
        throw e;
    }
}

//Expense/goal handling
exports.addExpense = async (amount, expense_name, budget_id) => {
    try {
        return await database.execute("insert into expense (amount, expense_name, budget_id) values (" + amount + ", '" + expense_name + "', " + budget_id + ")");
    } catch (e) {
        throw e;
    }
}

exports.getExpenseByBudget = async (budget_id) => {
    try {
        return await database.query("select e.expense_id, e.amount, e.expense_name, e.budget_id from expense e where e.budget_id =" + budget_id);
    } catch (e) {
        throw e;
    }
}

exports.getOnlyExpenseByBudget = async (budget_id) => {
    try {
        return await database.query("select e.expense_id, e.amount, e.expense_name, e.budget_id from only expense e where e.budget_id =" + budget_id);
    } catch (e) {
        throw e;
    }
}

exports.deleteExpense = async (expenseId) => {
    try {
        return await database.execute("DELETE from Expense where expense_id=" + expenseId);
    } catch (e) {
        throw e;
    }
}

exports.addGoal = async (amount, expense_name, budget_id, expiration_date, optional, amount_paid) => {
    try {
        return await database.execute("insert into goal (amount, expense_name, budget_id, expiration_date, optional, amount_paid)"
            + "values(" + amount + ", '" + expense_name + "', " + budget_id + ", '" + expiration_date + "', " + optional + ", " + amount_paid + ")");
    } catch (e) {
        throw e;
    }
}

exports.getGoalByBudget = async (budget_id) => {
    try {
        return await database.query("select expense_id, budget_id, amount, expense_name, expiration_date, optional, amount_paid from goal where budget_id =" + budget_id);
    } catch (e) {
        throw e;
    }
}