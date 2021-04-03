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

    render() {
        return (
            <a onClick={() => this.handleNewReleaseClick(this.props.data.account_id)}>
                {this.props.data.account_name}
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

    componentDidMount() {
        fetch("/finance/budget-list")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({ budgetArr: result });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    alert(error.Error);
                }
            )
   }

    render() {
        return (
            < span >
                {this.state.budgetArr.map((budget, index) => (
                    <li key={index}>
                        <Budget data={budget} />
                    </li>
                ))}
            </span>
        );
    }
}

const domContainer = document.querySelector('#budgetSubMenu');
ReactDOM.render(<BudgetList />, domContainer);
const expenseContainer = document.querySelector('#expenses');
ReactDOM.render(<ExpenseList />, expenseContainer);