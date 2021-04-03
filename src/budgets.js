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

class ExpenseForm extends React.Component {
    constructor(props) {
        super(props);
    }
    submitForm() {
        var params = {
            amount: documentGetElementById("amount").value,
            expenseName: documentGetElementById("expenseName").value,
            budgetId: documentGetElementById("budgetId").value
        }
        fetch("/finance/addExpense", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        })
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log(error);
                }
            )
    }

    render() {
        return (
            <div>
                <label htmlFor="amount">Expected amount:</label>
                <input type="number" name="amount" id="amount" /><br />
                <label htmlFor="expenseName">New password:</label>
                <input type="text" name="expenseName" id="expenseName" /><br />
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
        fetch("/finance/expense-list?budgetId=" + newRelease)
            .then(res => res.json())
            .then(
                (result) => {
                    eventBus.dispatch("expense", { message: result, budget: newRelease });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    alert(error);
                }
            )
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
            budgetArr: JSON.parse('<%- budget %>')
        };
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