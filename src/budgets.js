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

function updateExpenseList(budgetId) {
    if (budgetId == null)
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
            budgetId: null
        }
    }
    submitForm() {
        const amount = this.state.amount;
        const expenseName = this.state.expenseName;
        const budgetId = this.props.budgetId;
        var data = {
            amount: amount,
            expenseName: expenseName,
            budgetId: budgetId
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
    render() {
        return (
            <div>
                <label htmlFor="amount">Expected amount:</label>
                <input type="number" name="amount" id="amount" onChange={this.handleChangeAmount.bind(this)} /><br />
                <label htmlFor="expenseName">Name of expense:</label>
                <input type="text" name="expenseName" id="expenseName" onChange={this.handleChangeName.bind(this)} /><br />
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

    render() {
        return (
            <span>
                {this.props.data.expense_name} - {this.props.data.amount} - {this.props.data.expense_id}
            </span>
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
        return <div>
            <div>
                {this.state.budget != null ?
                    <button onClick={() => this.handleToggle()}>Toggle Expense adding</button>
                    : null}
                {this.state.showAddExpense ?
                    <ExpenseForm budgetId={this.state.budget} /> :
                    null
                }
            </div>
            {this.state.message.map((expense, index) => (
                <div key={index}>
                    <Expense data={expense} />
                </div>
            ))}
        </div>;
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
                        updateExpenseList(null);
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        alert(error.error);
                    }
                )
        }
    }

    render() {
        return (
            <a>
                <span onClick={() => this.handleNewReleaseClick(this.props.data.account_id)}>{this.props.data.account_name}</span>
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
                    alert(error.error);
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
                    alert(error);
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