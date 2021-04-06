'use strict';

const eventBus = {
    on(event, callback) {
        document.addEventListener(event, (e) => callback(e.detail));
    },
    dispatch(event, data) {
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    remove(event, callback) {
        document.removeEventListener(event, callback);
    },
};

function updateExpenseList(budget) {
    if (budget == null) {
        eventBus.dispatch("expense", { message: [], budget: null });
        return;
    }

    fetch("/finance/expense-list?budgetId=" + budget.account_id)
        .then(res => res.json())
        .then(
            (result) => {
                eventBus.dispatch("expense", { message: result, budget: budget});
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                alert(error);
            }
        )
}

class ExpenseForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: null,
            expenseName: null,
            budgetId: null,
            date: null,
            optional: false,
            amountPaid: null
        }
    }
    submitForm() {
        var data;
        if (this.props.goal) {
            data = {
                amount: this.state.amount,
                expenseName: this.state.expenseName,
                budgetId: this.props.budgetId,
                date: this.state.date,
                optional: this.state.optional,
                amountPaid: this.state.amountPaid,
                goal: true
            }
        } else {
            data = {
                amount: this.state.amount,
                expenseName: this.state.expenseName,
                budgetId: this.props.budgetId,
                goal: false
            }
        }
        fetch("/finance/addExpense", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(
                (result) => {
                    updateExpenseList(this.props.budget);
                    this.props.resetRender(null);
                },
                (error) => {
                    alert(error);
                }
            )
    }

    handleChangeAmount(event) {
        this.setState({ amount: event.target.value });
    }
    handleChangeName(event) {
        this.setState({ expenseName: event.target.value });
    }
    handleChangeDate(event) {
        this.setState({ date: event.target.value });
    }
    handleChangeOptional(event) {
        if (this.state.optional)
            this.setState({ optional: false });
        else
            this.setState({ optional: true });
    }
    handleChangeAmountPaid(event) {
        this.setState({ amountPaid: event.target.value });
    }
    render() {
        return (
            <div id="AddExpenseForm">
                <i onClick={() => this.props.resetRender(null)} className="fa fa-times-circle deleteMe"></i>
                <label htmlFor="expenseName">Name of expense:</label>
                <input type="text" name="expenseName" id="expenseName" onChange={this.handleChangeName.bind(this)} /><br />
                <label htmlFor="amount">Expected cost:</label>
                <input type="number" name="amount" id="amount" onChange={this.handleChangeAmount.bind(this)} /><br />
                {this.props.goal == true ?
                    (<span><label htmlFor="date">Expiration date:</label>
                        <input type="date" name="date" id="date" onChange={this.handleChangeDate.bind(this)} /><br />
                        <label htmlFor="optional">Optional:</label>
                        <input type="checkbox" name="optional" id="optional" onChange={this.handleChangeOptional.bind(this)} /><br />
                        <label htmlFor="amountPaid">Amount paid:</label>
                        <input type="number" name="amountPaid" id="amountPaid" onChange={this.handleChangeAmountPaid.bind(this)} /><br /></span>) : null}
                <label htmlFor="budgetId">Budget ID:</label>
                <input type="text" name="budgetId" id="budgetId" readOnly value={this.props.budgetId} /><br />
                <input type="submit" value="Submit" id="registerSubmit" onClick={() => this.submitForm()} />
            </div>
        );
    }
}

class Expense extends React.Component {
    constructor(props) {
        super(props);
    }

    deleteExpense() {
        if (confirm("Are you sure you want to delete expense: '" + this.props.data.expense_name + "'")) {
            fetch("/finance/deleteExpense?expenseId=" + this.props.data.expense_id)
                .then(res => res.json())
                .then(
                    (result) => {
                        updateExpenseList(this.props.budget);
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        alert("Error!");
                        console.log(error);
                    }
                )
        }
    }

    render() {
        return (
            <tr onClick={() => this.deleteExpense()}>
                <td>{this.props.data.expense_name}</td>
                <td>{this.props.data.amount}</td>
                <td>{this.props.data.expiration_date}</td>
                <td>{this.props.data.optional == null ? "False" : "True"}</td>
                <td>{this.props.data.amount_paid}</td>
            </tr>
        );
    }
}

class ExpenseTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <table style={{ width: 90 + '%', margin: 'auto' }}>
                <thead>
                    <tr style={{ fontWeight: 'bolder' }}>
                        <td>Expense name</td>
                        <td>Amount</td>
                        <td>Expiration</td>
                        <td>Optional</td>
                        <td>Amount paid</td>
                    </tr>
                </thead>
                <tbody>
                    {this.props.message.map((expense, index) => (
                        <Expense data={expense} budget={this.props.budget} key={index} />
                    ))}
                </tbody>
            </table>
        );
    }
}

class ExpenseFormDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            goal: null
        }
    }

    renderExpenseForm(goalStatus) {
        this.setState({ goal: goalStatus });
    }

    render() {
        return (
            <div className="container">
                <div className="dropdown" style={{ float: 'left' }} >
                    <button className="btn btn-success" type="button" data-toggle="dropdown">Add <span className="caret"></span></button>
                    <ul className="dropdown-menu">
                        <li className="ExpenseDropDown" onClick={() => this.renderExpenseForm(false)}>Expense</li>
                        <li className="ExpenseDropDown" onClick={() => this.renderExpenseForm(true)}>Goal</li>
                    </ul>
                </div>
                {this.state.goal != null ? <ExpenseForm budgetId={this.props.budgetId} budget={this.props.budget} goal={this.state.goal} resetRender={this.renderExpenseForm.bind(this)} /> : null}
            </div>
        );
    }
}

class HighLevelMetrics extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let allExpenses = this.props.data;
        var afterTax = this.props.budget.salary;
        var cost = 0;
        var i;
        for (i = 0; i < allExpenses.length; i++) {
            cost += parseFloat(allExpenses[i].amount);
        }
        var includeTax = (afterTax * parseFloat(this.props.budget.tax_rate))
        afterTax -= includeTax
        afterTax -= (cost * 12);
        var yearly = (afterTax.toFixed(2));
        var monthly = ((afterTax / 12).toFixed(2));
        var weekly = ((afterTax / 48).toFixed(2));
        return (
            <div className="container" style={{ textAlign: "center", marginBottom: 15 + "px" }}>
                <div className="row">
                    <div className="col">
                        <div className="notification">
                            <div className="notification_title">Yearly quota</div>
                            <div className="notification_desc">${yearly}</div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="notification">
                            <div className="notification_title">Monthly quota</div>
                            <div className="notification_desc" id="nearEmpty">${monthly}</div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="notification">
                            <div className="notification_title">Weekly quota</div>
                            <div className="notification_desc" id="empty">${weekly}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class ExpenseList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: [],
            budget: null,
        }
    }
    changeTaxRate() {
        var newTax;
        do {
            newTax = prompt("What is the new tax rate you want? Please enter as percentage (E.G. 0.235 should be 23.5%)")
            if (newTax == null)
                return;
        } while (isNaN(newTax))
        newTax = parseFloat(newTax);
        newTax = newTax / 100;
        newTax = newTax.toFixed(4);

        fetch("/finance/updateBudgetTax?budgetId=" + this.state.budget.account_id + "&taxRate=" + newTax)
            .then(res => res.json())
            .then(
                (result) => {
                    location.reload();
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    alert("Error!");
                    console.log(error)
                }
            )
    }

    componentDidMount() {
        eventBus.on("expense", (data) =>
            this.setState({ message: data.message, budget: data.budget })
        );
    }

    componentWillUnmount() {
        eventBus.remove("expense");
    }


    render() {
        let tax_rate;
        if(this.state.budget != null)
            tax_rate = (parseFloat(this.state.budget.tax_rate) * 100) + "%";

        return (
            <div>
                {this.state.budget != null ?
                    < span >
                        <h2 style={{ textAlign: "center" }}>{this.state.budget.account_name}</h2>
                        <h4 id="taxRate">{tax_rate} <i className="fa fa-edit editMe" onClick={() => this.changeTaxRate()} ></i></h4>
                        <HighLevelMetrics data={this.state.message} budget={this.state.budget} />
                        <ExpenseFormDropDown budgetId={this.state.budget.account_id} budget={this.state.budget} />
                        <ExpenseTable message={this.state.message} budget={this.state.budget} />
                    </span> : null
                }
            </div>
        );
    }
}

class Budget extends React.Component {
    constructor(props) {
        super(props);
    }

    handleNewReleaseClick(newRelease) {
        updateExpenseList(newRelease);
    }
    deleteBudget() {
        if (confirm("Are you sure you want to delete budget: '" + this.props.data.account_name + "'")) {
            fetch("/finance/deleteBudget?budgetId=" + this.props.data.account_id)
                .then(res => res.json())
                .then(
                    (result) => {
                        this.props.updateFunction();
                        updateExpenseList(null);
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        alert("Error!");
                        console.log(error)
                    }
                )
        }
    }

    render() {
        return (
            <a onClick={() => this.handleNewReleaseClick(this.props.data)}>
                <span>{this.props.data.account_name}</span>
                <i className="fa fa-minus-circle deleteMe" onClick={() => this.deleteBudget()}></i>
            </a>
        );
    }
}

class BudgetList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            budgetArr: []
        };
    }
    updateBudgets() {
        fetch("/finance/budget-list")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({ budgetArr: result });
                },

                (error) => {
                    alert("Error!");
                    console.log(error);
                }
            )
    }

    componentDidMount() {
        this.updateBudgets();
    }

    addBudget() {
        var getName;
        do {
            getName = prompt("What is the name of the budget?");
            if (getName == null)
                return;
        } while (getName.trim() == "")
        var getSalary;
        do {
            getSalary = prompt("What is the expected salary? Enter only numbers.");
            if (getSalary == null)
                return;
        } while (isNaN(getSalary))
        var taxRate;
        if (getSalary < 10000)
            taxRate = 0.175;
        else {
            taxRate = parseFloat(((0.175) + (0.0075 * (Math.round((getSalary - 10000) / 5000)))).toFixed(4));
        }

        var data = {
            salary: getSalary,
            accountName: getName,
            taxRate: taxRate
        };

        fetch("/finance/addBudget", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(
                (result) => {
                    this.updateBudgets();
                },
                (error) => {
                    alert("Error!");
                    console.log(error);
                }
            )
    }

    render() {
        return (
            <span>
                <li>
                    {this.state.budgetArr.map((budget, index) => (
                        <div key={index}>
                            <Budget data={budget} updateFunction={this.updateBudgets.bind(this)} />
                        </div>
                    ))}
                </li>
                <li>
                    <a className="btn btn-success btn-lg sideBarButtons" onClick={() => this.addBudget()}>Add budget</a>
                </li>
                <li>
                    <a href="/finance/logout" className="btn btn-danger btn-lg sideBarButtons" id="logout"><i className="fa fa-sign-out"></i>Log out</a>
                </li>
            </span>

        );
    }
}

const domContainer = document.querySelector('#budgetSubMenu');
ReactDOM.render(<BudgetList />, domContainer);
const expenseContainer = document.querySelector('#expenses');
ReactDOM.render(<ExpenseList />, expenseContainer);