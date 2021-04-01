'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var eventBus = {
    on: function on(event, callback) {
        document.addEventListener(event, function (e) {
            return callback(e.detail);
        });
    },
    dispatch: function dispatch(event, data) {
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    remove: function remove(event, callback) {
        document.removeEventListener(event, callback);
    }
};

var Expense = function (_React$Component) {
    _inherits(Expense, _React$Component);

    function Expense(props) {
        _classCallCheck(this, Expense);

        return _possibleConstructorReturn(this, (Expense.__proto__ || Object.getPrototypeOf(Expense)).call(this, props));
    }

    _createClass(Expense, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "span",
                null,
                this.props.data.expense_name,
                " - ",
                this.props.data.amount,
                " - ",
                this.props.data.expense_id
            );
        }
    }]);

    return Expense;
}(React.Component);

var ExpenseList = function (_React$Component2) {
    _inherits(ExpenseList, _React$Component2);

    function ExpenseList(props) {
        _classCallCheck(this, ExpenseList);

        var _this2 = _possibleConstructorReturn(this, (ExpenseList.__proto__ || Object.getPrototypeOf(ExpenseList)).call(this, props));

        _this2.state = {
            message: []
        };
        return _this2;
    }

    _createClass(ExpenseList, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this3 = this;

            eventBus.on("expense", function (data) {
                return _this3.setState({ message: data.message });
            });
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            eventBus.remove("expense");
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "pre",
                null,
                this.state.message.map(function (expense, index) {
                    return React.createElement(
                        "div",
                        { key: index },
                        React.createElement(Expense, { data: expense })
                    );
                })
            );
        }
    }]);

    return ExpenseList;
}(React.Component);

var Budget = function (_React$Component3) {
    _inherits(Budget, _React$Component3);

    function Budget(props) {
        _classCallCheck(this, Budget);

        return _possibleConstructorReturn(this, (Budget.__proto__ || Object.getPrototypeOf(Budget)).call(this, props));
    }

    _createClass(Budget, [{
        key: "handleNewReleaseClick",
        value: function handleNewReleaseClick(newRelease) {
            fetch("/finance/expense-list?budgetId=" + newRelease).then(function (res) {
                return res.json();
            }).then(function (result) {
                eventBus.dispatch("expense", { message: result });
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            function (error) {
                eventBus.dispatch("expense", { message: error });
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this5 = this;

            return React.createElement(
                "a",
                { onClick: function onClick() {
                        return _this5.handleNewReleaseClick(_this5.props.data.account_id);
                    } },
                this.props.data.account_name
            );
        }
    }]);

    return Budget;
}(React.Component);

var BudgetList = function (_React$Component4) {
    _inherits(BudgetList, _React$Component4);

    function BudgetList(props) {
        _classCallCheck(this, BudgetList);

        var _this6 = _possibleConstructorReturn(this, (BudgetList.__proto__ || Object.getPrototypeOf(BudgetList)).call(this, props));

        _this6.state = {
            budgetArr: JSON.parse('<%- budget %>')
        };
        return _this6;
    }

    _createClass(BudgetList, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "span",
                null,
                this.state.budgetArr.map(function (budget, index) {
                    return React.createElement(
                        "li",
                        { key: index },
                        React.createElement(Budget, { data: budget })
                    );
                })
            );
        }
    }]);

    return BudgetList;
}(React.Component);

var domContainer = document.querySelector('#budgetSubMenu');
ReactDOM.render(React.createElement(BudgetList, null), domContainer);
var expenseContainer = document.querySelector('#expenses');
ReactDOM.render(React.createElement(ExpenseList, null), expenseContainer);