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
            message: []
        }
    }

    componentDidMount() {
        eventBus.on("expense", (data) =>
            this.setState({ message: data.message })
        );
    }

    componentWillUnmount() {
        eventBus.remove("expense");
    }

    render() {
        return <pre>
            {this.state.message.map((expense, index) => (
                <div key={index}>
                    <Expense data={expense} />
                </div>
            ))}
        </pre>;
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
                    eventBus.dispatch("expense", { message: result });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    eventBus.dispatch("expense", { message: error });
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