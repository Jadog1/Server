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
        this.state = {
            message: "Random"
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
        return <pre>{this.state.message}</pre>;
    }
}

class Budget extends React.Component {
    constructor(props) {
        super(props);
    }

    handleNewReleaseClick(newRelease) {
        eventBus.dispatch("expense", { message: newRelease });
    }

    render() {
        return (
            <a onClick={() => this.handleNewReleaseClick(Math.random())}>
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
ReactDOM.render(<Expense />, expenseContainer);