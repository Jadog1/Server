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
    var needNull = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (needNull == true) eventBus.dispatch("expense", { message: [], budget: null });

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
            budgetId: null,
            goal: false,
            date: null,
            optional: false,
            amountPaid: null
        };
        return _this;
    }

    _createClass(ExpenseForm, [{
        key: "submitForm",
        value: function submitForm() {
            var _this2 = this;

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
                };
            } else {
                data = {
                    amount: this.state.amount,
                    expenseName: this.state.expenseName,
                    budgetId: this.props.budgetId,
                    goal: false
                };
            }
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
        key: "handleChangeDate",
        value: function handleChangeDate(event) {
            this.setState({ date: event.target.value });
        }
    }, {
        key: "handleChangeOptional",
        value: function handleChangeOptional(event) {
            if (this.state.optional) this.setState({ optional: false });else this.setState({ optional: true });
        }
    }, {
        key: "handleChangeAmountPaid",
        value: function handleChangeAmountPaid(event) {
            this.setState({ AmountPaid: event.target.value });
        }
    }, {
        key: "toggleGoal",
        value: function toggleGoal() {
            if (this.state.goal) this.setState({ goal: false });else this.setState({ goal: true });
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            return React.createElement(
                "div",
                { id: "AddExpenseForm" },
                "Goal: ",
                React.createElement("input", { type: "checkbox", onClick: function onClick() {
                        return _this3.toggleGoal();
                    } }),
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
                    { htmlFor: "amount" },
                    "Expected cost:"
                ),
                React.createElement("input", { type: "number", name: "amount", id: "amount", onChange: this.handleChangeAmount.bind(this) }),
                React.createElement("br", null),
                React.createElement(
                    "label",
                    { htmlFor: "date" },
                    "Expiration date:"
                ),
                React.createElement("input", { type: "date", name: "date", id: "date", onChange: this.handleChangeDate.bind(this) }),
                React.createElement("br", null),
                React.createElement(
                    "label",
                    { htmlFor: "optional" },
                    "Optional:"
                ),
                React.createElement("input", { type: "checkbox", name: "optional", id: "optional", onChange: this.handleChangeOptional.bind(this) }),
                React.createElement("br", null),
                React.createElement(
                    "label",
                    { htmlFor: "amountPaid" },
                    "Amount paid:"
                ),
                React.createElement("input", { type: "number", name: "amountPaid", id: "amountPaid", onChange: this.handleChangeAmountPaid.bind(this) }),
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
        key: "deleteExpense",
        value: function deleteExpense() {
            var _this5 = this;

            if (confirm("Are you sure you want to delete expense: '" + this.props.data.expense_name + "'")) {
                fetch("/finance/deleteExpense?expenseId=" + this.props.data.expense_id).then(function (res) {
                    return res.json();
                }).then(function (result) {
                    updateExpenseList(_this5.props.data.budget_id);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                function (error) {
                    alert("Error!");
                    console.log(error);
                });
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this6 = this;

            return React.createElement(
                "tr",
                { onClick: function onClick() {
                        return _this6.deleteExpense();
                    } },
                React.createElement(
                    "td",
                    null,
                    this.props.data.expense_name
                ),
                React.createElement(
                    "td",
                    null,
                    this.props.data.amount
                ),
                React.createElement(
                    "td",
                    null,
                    this.props.data.expiration_date
                ),
                React.createElement(
                    "td",
                    null,
                    this.props.data.optional == null ? "False" : "True"
                ),
                React.createElement(
                    "td",
                    null,
                    this.props.data.amount_paid
                )
            );
        }
    }]);

    return Expense;
}(React.Component);

var ExpenseTable = function (_React$Component3) {
    _inherits(ExpenseTable, _React$Component3);

    function ExpenseTable(props) {
        _classCallCheck(this, ExpenseTable);

        return _possibleConstructorReturn(this, (ExpenseTable.__proto__ || Object.getPrototypeOf(ExpenseTable)).call(this, props));
    }

    _createClass(ExpenseTable, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "table",
                { style: { width: 90 + '%', margin: 'auto' } },
                React.createElement(
                    "thead",
                    null,
                    React.createElement(
                        "tr",
                        { style: { fontWeight: 'bolder' } },
                        React.createElement(
                            "td",
                            null,
                            "Expense name"
                        ),
                        React.createElement(
                            "td",
                            null,
                            "Amount"
                        ),
                        React.createElement(
                            "td",
                            null,
                            "Expiration"
                        ),
                        React.createElement(
                            "td",
                            null,
                            "Optional"
                        ),
                        React.createElement(
                            "td",
                            null,
                            "Amount paid"
                        )
                    )
                ),
                React.createElement(
                    "tbody",
                    null,
                    this.props.message.map(function (expense, index) {
                        return React.createElement(Expense, { data: expense, key: index });
                    })
                )
            );
        }
    }]);

    return ExpenseTable;
}(React.Component);

var ExpenseList = function (_React$Component4) {
    _inherits(ExpenseList, _React$Component4);

    function ExpenseList(props) {
        _classCallCheck(this, ExpenseList);

        var _this8 = _possibleConstructorReturn(this, (ExpenseList.__proto__ || Object.getPrototypeOf(ExpenseList)).call(this, props));

        _this8.state = {
            message: [],
            budget: null,
            showAddExpense: false
        };
        return _this8;
    }

    _createClass(ExpenseList, [{
        key: "handleToggle",
        value: function handleToggle() {
            if (this.state.showAddExpense) this.setState({ showAddExpense: false });else this.setState({ showAddExpense: true });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this9 = this;

            eventBus.on("expense", function (data) {
                return _this9.setState({ message: data.message, budget: data.budget });
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
            var _this10 = this;

            var table = void 0;
            if (this.state.budget != null) table = React.createElement(ExpenseTable, { message: this.state.message });

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    null,
                    this.state.budget != null ? React.createElement(
                        "button",
                        { className: "btn btn-success", style: { float: "right" }, onClick: function onClick() {
                                return _this10.handleToggle();
                            } },
                        "Add"
                    ) : null,
                    this.state.showAddExpense ? React.createElement(ExpenseForm, { budgetId: this.state.budget }) : null
                ),
                table
            );
        }
    }]);

    return ExpenseList;
}(React.Component);

var Budget = function (_React$Component5) {
    _inherits(Budget, _React$Component5);

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
        key: "deleteBudget",
        value: function deleteBudget() {
            var _this12 = this;

            if (confirm("Are you sure you want to delete budget " + this.props.data.account_name)) {
                fetch("/finance/deleteBudget?budgetId=" + this.props.data.account_id).then(function (res) {
                    return res.json();
                }).then(function (result) {
                    _this12.props.updateFunction();
                    updateExpenseList(null, true);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                function (error) {
                    alert("Error!");
                    console.log(error);
                });
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this13 = this;

            return React.createElement(
                "a",
                { onClick: function onClick() {
                        return _this13.handleNewReleaseClick(_this13.props.data.account_id);
                    } },
                React.createElement(
                    "span",
                    null,
                    this.props.data.account_name
                ),
                React.createElement("i", { className: "fa fa-minus-circle deleteMe", onClick: function onClick() {
                        return _this13.deleteBudget();
                    } })
            );
        }
    }]);

    return Budget;
}(React.Component);

var BudgetList = function (_React$Component6) {
    _inherits(BudgetList, _React$Component6);

    function BudgetList(props) {
        _classCallCheck(this, BudgetList);

        var _this14 = _possibleConstructorReturn(this, (BudgetList.__proto__ || Object.getPrototypeOf(BudgetList)).call(this, props));

        _this14.state = {
            budgetArr: []
        };
        return _this14;
    }

    _createClass(BudgetList, [{
        key: "updateBudgets",
        value: function updateBudgets() {
            var _this15 = this;

            fetch("/finance/budget-list").then(function (res) {
                return res.json();
            }).then(function (result) {
                _this15.setState({ budgetArr: result });
            }, function (error) {
                alert("Error!");
                console.log(error);
            });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.updateBudgets();
        }
    }, {
        key: "addBudget",
        value: function addBudget() {
            var _this16 = this;

            var getSalary;
            do {
                getSalary = prompt("What is the expected salary? Enter only numbers.");
                if (getSalary == null) return;
            } while (isNaN(getSalary));
            var getName;
            do {
                getName = prompt("What is the name of the budget?");
                if (getName == null) return;
            } while (getName.trim() == "");

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
            }).then(function (res) {
                return res.json();
            }).then(function (result) {
                _this16.updateBudgets();
            }, function (error) {
                alert("Error!");
                console.log(error);
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this17 = this;

            return React.createElement(
                "span",
                null,
                React.createElement(
                    "li",
                    null,
                    this.state.budgetArr.map(function (budget, index) {
                        return React.createElement(
                            "div",
                            { key: index },
                            React.createElement(Budget, { data: budget, updateFunction: _this17.updateBudgets.bind(_this17) })
                        );
                    })
                ),
                React.createElement(
                    "li",
                    null,
                    React.createElement(
                        "a",
                        { className: "btn btn-success btn-lg sideBarButtons", onClick: function onClick() {
                                return _this17.addBudget();
                            } },
                        "Add budget"
                    )
                ),
                React.createElement(
                    "li",
                    null,
                    React.createElement(
                        "a",
                        { href: "/finance/logout", className: "btn btn-danger btn-lg sideBarButtons", id: "logout" },
                        React.createElement("i", { className: "fa fa-sign-out" }),
                        "Log out"
                    )
                )
            );
        }
    }]);

    return BudgetList;
}(React.Component);

var domContainer = document.querySelector('#budgetSubMenu');
ReactDOM.render(React.createElement(BudgetList, null), domContainer);
var expenseContainer = document.querySelector('#expenses');
ReactDOM.render(React.createElement(ExpenseList, null), expenseContainer);