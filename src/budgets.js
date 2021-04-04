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

function updateExpenseList(budgetId, needNull = false) {
    if (needNull == true)
        eventBus.dispatch("expense", { message: [], budget: null });

    fetch("/finance/expense-list?budgetId=" + budgetId)
        .then(res => res.json())
        .then(
            (result) => {
                eventBus.dispatch("expense", { message: result, budget: budgetId });
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
            goal: false,
            date: null,
            optional: false,
            amountPaid: null
        }
    }
    submitForm() {
        var data;
        if (this.state.goal) {
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
                    updateExpenseList(this.props.budgetId);
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
    toggleGoal() {
        if (this.state.goal)
            this.setState({ goal: false });
        else
            this.setState({ goal: true });
    }
    render() {
        return (
            <div id="AddExpenseForm">
                Goal: <input type="checkbox" onClick={() => this.toggleGoal() } /><br />
                <label htmlFor="expenseName">Name of expense:</label>
                <input type="text" name="expenseName" id="expenseName" onChange={this.handleChangeName.bind(this)} /><br />
                <label htmlFor="amount">Expected cost:</label>
                <input type="number" name="amount" id="amount" onChange={this.handleChangeAmount.bind(this)} /><br />
                <label htmlFor="date">Expiration date:</label>
                <input type="date" name="date" id="date" onChange={this.handleChangeDate.bind(this)} /><br />
                <label htmlFor="optional">Optional:</label>
                <input type="checkbox" name="optional" id="optional" onChange={this.handleChangeOptional.bind(this)} /><br />
                <label htmlFor="amountPaid">Amount paid:</label>
                <input type="number" name="amountPaid" id="amountPaid" onChange={this.handleChangeAmountPaid.bind(this)} /><br />
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
                        updateExpenseList(this.props.data.budget_id);
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
                        <Expense data={expense} key={index} />
                    ))}
                </tbody>
            </table>
        );
    }
}

class ExpenseList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: [],
            budget: null,
            showAddExpense: false
        }
    }

    handleToggle() {
        if (this.state.showAddExpense)
            this.setState({ showAddExpense: false });
        else
            this.setState({ showAddExpense: true });
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
        let table;
        if (this.state.budget != null)
            table = <ExpenseTable message={this.state.message} />

        return (
            <div>
                <div>
                    {this.state.budget != null ?
                        <button className="btn btn-success" style={{ float: "right" }} onClick={() => this.handleToggle()}>Add</button>
                        : null}
                    {this.state.showAddExpense ?
                        <ExpenseForm budgetId={this.state.budget} /> :
                        null
                    }
                </div>
                {table}
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
        if (confirm("Are you sure you want to delete budget " + this.props.data.account_name)) {
            fetch("/finance/deleteBudget?budgetId=" + this.props.data.account_id)
                .then(res => res.json())
                .then(
                    (result) => {
                        this.props.updateFunction();
                        updateExpenseList(null, true);
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
            <a onClick={() => this.handleNewReleaseClick(this.props.data.account_id)}>
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
        var getSalary;
        do {
            getSalary = prompt("What is the expected salary? Enter only numbers.");
            if (getSalary == null)
                return;
        } while (isNaN(getSalary))
        var getName;
        do {
            getName = prompt("What is the name of the budget?");
            if (getName == null)
                return;
        } while (getName.trim() == "")

        var data = {
            salary: getSalary,
            accountName: getName
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