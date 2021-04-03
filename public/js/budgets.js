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

function updateExpenseList(budgetId) {
    fetch("/finance/expense-list?budgetId=" + budgetId).then(function (res) {
        return res.json();
    }).then(function (result) {
        eventBus.dispatch("expense", { message: result, budget: budgetId });
    },
    // Note: it's important to handle errors here
    // instead of a catch() block so that we don't swallow
    // exceptions from actual bugs in components.
    function (error) {
        alert(error);
    });
}

var ExpenseForm = function (_React$Component) {
    _inherits(ExpenseForm, _React$Component);

    function ExpenseForm(props) {
        _classCallCheck(this, ExpenseForm);

        var _this = _possibleConstructorReturn(this, (ExpenseForm.__proto__ || Object.getPrototypeOf(ExpenseForm)).call(this, props));

        _this.state = {
            amount: null,
            expenseName: null,
            budgetId: null
        };
        return _this;
    }

    _createClass(ExpenseForm, [{
        key: "submitForm",
        value: function submitForm() {
            var _this2 = this;

            var amount = this.state.amount;
            var expenseName = this.state.expenseName;
            var budgetId = this.props.budgetId;
            var data = {
                amount: amount,
                expenseName: expenseName,
                budgetId: budgetId
            };
            fetch("/finance/addExpense", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(function (res) {
                return res.json();
            }).then(function (result) {
                updateExpenseList(_this2.props.budgetId);
            }, function (error) {
                alert(error);
            });
        }
    }, {
        key: "handleChangeAmount",
        value: function handleChangeAmount(event) {
            this.setState({ amount: event.target.value });
        }
    }, {
        key: "handleChangeName",
        value: function handleChangeName(event) {
            this.setState({ expenseName: event.target.value });
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "label",
                    { htmlFor: "amount" },
                    "Expected amount:"
                ),
                React.createElement("input", { type: "number", name: "amount", id: "amount", onChange: this.handleChangeAmount.bind(this) }),
                React.createElement("br", null),
                React.createElement(
                    "label",
                    { htmlFor: "expenseName" },
                    "Name of expense:"
                ),
                React.createElement("input", { type: "text", name: "expenseName", id: "expenseName", onChange: this.handleChangeName.bind(this) }),
                React.createElement("br", null),
                React.createElement(
                    "label",
                    { htmlFor: "budgetId" },
                    "Budget ID:"
                ),
                React.createElement("input", { type: "text", name: "budgetId", id: "budgetId", readOnly: true, value: this.props.budgetId }),
                React.createElement("br", null),
                React.createElement("input", { type: "submit", value: "Submit", id: "registerSubmit", onClick: function onClick() {
                        return _this3.submitForm();
                    } })
            );
        }
    }]);

    return ExpenseForm;
}(React.Component);

var Expense = function (_React$Component2) {
    _inherits(Expense, _React$Component2);

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

var ExpenseList = function (_React$Component3) {
    _inherits(ExpenseList, _React$Component3);

    function ExpenseList(props) {
        _classCallCheck(this, ExpenseList);

        var _this5 = _possibleConstructorReturn(this, (ExpenseList.__proto__ || Object.getPrototypeOf(ExpenseList)).call(this, props));

        _this5.state = {
            message: [],
            budget: null,
            showAddExpense: false
        };
        return _this5;
    }

    _createClass(ExpenseList, [{
        key: "handleToggle",
        value: function handleToggle() {
            if (this.state.showAddExpense) this.setState({ showAddExpense: false });else this.setState({ showAddExpense: true });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this6 = this;

            eventBus.on("expense", function (data) {
                return _this6.setState({ message: data.message, budget: data.budget });
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
            var _this7 = this;

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    null,
                    this.state.budget != null ? React.createElement(
                        "button",
                        { onClick: function onClick() {
                                return _this7.handleToggle();
                            } },
                        "Toggle Expense adding"
                    ) : null,
                    this.state.showAddExpense ? React.createElement(ExpenseForm, { budgetId: this.state.budget }) : null
                ),
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

var Budget = function (_React$Component4) {
    _inherits(Budget, _React$Component4);

    function Budget(props) {
        _classCallCheck(this, Budget);

        return _possibleConstructorReturn(this, (Budget.__proto__ || Object.getPrototypeOf(Budget)).call(this, props));
    }

    _createClass(Budget, [{
        key: "handleNewReleaseClick",
        value: function handleNewReleaseClick(newRelease) {
            updateExpenseList(newRelease);
        }
    }, {
        key: "render",
        value: function render() {
            var _this9 = this;

            return React.createElement(
                "a",
                { onClick: function onClick() {
                        return _this9.handleNewReleaseClick(_this9.props.data.account_id);
                    } },
                this.props.data.account_name
            );
        }
    }]);

    return Budget;
}(React.Component);

var BudgetList = function (_React$Component5) {
    _inherits(BudgetList, _React$Component5);

    function BudgetList(props) {
        _classCallCheck(this, BudgetList);

        var _this10 = _possibleConstructorReturn(this, (BudgetList.__proto__ || Object.getPrototypeOf(BudgetList)).call(this, props));

        _this10.state = {
            budgetArr: []
        };
        return _this10;
    }

    _createClass(BudgetList, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this11 = this;

            fetch("/finance/budget-list").then(function (res) {
                return res.json();
            }).then(function (result) {
                _this11.setState({ budgetArr: result });
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            function (error) {
                alert(error.Error);
            });
        }
    }, {
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