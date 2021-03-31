'use strict';

class Budget extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {this.props.data.salary}
                {this.props.data.account_id}
                {this.props.data.account_name}
            </div>
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
            < div >
                {this.state.budgetArr.map((budget, index) => (
                    <div key={index} class="budget">
                        <Budget data={budget} />
                    </div>
                ))}
            </div>
        );
    }
}

const domContainer = document.querySelector('#ReactComponents');
ReactDOM.render(<BudgetList />, domContainer);