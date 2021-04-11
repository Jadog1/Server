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

function updateExpenseList(budget) {
    if (budget == null) {
        eventBus.dispatch("expense", { message: [], budget: null });
        return;
    }

    fetch("/finance/expense-list?budgetId=" + budget.account_id).then(function (res) {
        return res.json();
    }).then(function (result) {
        eventBus.dispatch("expense", { message: result, budget: budget });
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
            if (this.props.goal) {
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
                updateExpenseList(_this2.props.budget);
                _this2.props.resetRender(null);
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
            this.setState({ amountPaid: event.target.value });
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            return React.createElement(
                "div",
                { id: "AddExpenseForm" },
                React.createElement("i", { onClick: function onClick() {
                        return _this3.props.resetRender(null);
                    }, className: "fa fa-times-circle deleteMe" }),
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
                    "Monthly expected cost:"
                ),
                React.createElement("input", { type: "number", name: "amount", id: "amount", onChange: this.handleChangeAmount.bind(this) }),
                React.createElement("br", null),
                this.props.goal == true ? React.createElement(
                    "span",
                    null,
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
                        "Optional payments:"
                    ),
                    React.createElement("input", { type: "checkbox", name: "optional", id: "optional", onChange: this.handleChangeOptional.bind(this) }),
                    React.createElement("br", null),
                    React.createElement(
                        "label",
                        { htmlFor: "amountPaid" },
                        "Amount paid:"
                    ),
                    React.createElement("input", { type: "number", name: "amountPaid", id: "amountPaid", onChange: this.handleChangeAmountPaid.bind(this) }),
                    React.createElement("br", null)
                ) : null,
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
                    updateExpenseList(_this5.props.budget);
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

            var amountFormat = parseFloat(this.props.data.amount).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
            var amount_paidFormat = void 0;
            if (this.props.data.amount_paid != null) amount_paidFormat = "$" + parseFloat(this.props.data.amount_paid).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
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
                    "$",
                    amountFormat
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
                    amount_paidFormat
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
            var _this8 = this;

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
                        return React.createElement(Expense, { data: expense, budget: _this8.props.budget, key: index });
                    })
                )
            );
        }
    }]);

    return ExpenseTable;
}(React.Component);

var ExpenseFormDropDown = function (_React$Component4) {
    _inherits(ExpenseFormDropDown, _React$Component4);

    function ExpenseFormDropDown(props) {
        _classCallCheck(this, ExpenseFormDropDown);

        var _this9 = _possibleConstructorReturn(this, (ExpenseFormDropDown.__proto__ || Object.getPrototypeOf(ExpenseFormDropDown)).call(this, props));

        _this9.state = {
            goal: null
        };
        return _this9;
    }

    _createClass(ExpenseFormDropDown, [{
        key: "renderExpenseForm",
        value: function renderExpenseForm(goalStatus) {
            this.setState({ goal: goalStatus });
        }
    }, {
        key: "render",
        value: function render() {
            var _this10 = this;

            return React.createElement(
                "div",
                { className: "container" },
                React.createElement(
                    "div",
                    { className: "dropdown", style: { float: 'left' } },
                    React.createElement(
                        "button",
                        { className: "btn btn-success", type: "button", "data-toggle": "dropdown" },
                        "Add ",
                        React.createElement("span", { className: "caret" })
                    ),
                    React.createElement(
                        "ul",
                        { className: "dropdown-menu" },
                        React.createElement(
                            "li",
                            { className: "ExpenseDropDown", onClick: function onClick() {
                                    return _this10.renderExpenseForm(false);
                                } },
                            "Expense"
                        ),
                        React.createElement(
                            "li",
                            { className: "ExpenseDropDown", onClick: function onClick() {
                                    return _this10.renderExpenseForm(true);
                                } },
                            "Goal"
                        )
                    )
                ),
                this.state.goal != null ? React.createElement(ExpenseForm, { budgetId: this.props.budgetId, budget: this.props.budget, goal: this.state.goal, resetRender: this.renderExpenseForm.bind(this) }) : null
            );
        }
    }]);

    return ExpenseFormDropDown;
}(React.Component);

var HighLevelMetrics = function (_React$Component5) {
    _inherits(HighLevelMetrics, _React$Component5);

    function HighLevelMetrics(props) {
        _classCallCheck(this, HighLevelMetrics);

        return _possibleConstructorReturn(this, (HighLevelMetrics.__proto__ || Object.getPrototypeOf(HighLevelMetrics)).call(this, props));
    }

    _createClass(HighLevelMetrics, [{
        key: "render",
        value: function render() {
            var allExpenses = this.props.data;
            var afterTax = this.props.budget.salary;
            var cost = 0;
            var i;
            for (i = 0; i < allExpenses.length; i++) {
                var expenseAmount = parseFloat(allExpenses[i].amount);
                if (allExpenses[i].expiration_date != null) {
                    expenseAmount -= parseFloat(allExpenses[i].amount_paid);
                    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                    var secondDate = new Date(allExpenses[i].expiration_date + "T00:00:00");
                    var firstDate = new Date();
                    var numDays = Math.ceil(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
                    var numMonths = numDays / 30 < 1 ? 1 : Math.floor(numDays / 30);
                    expenseAmount = expenseAmount / numMonths * 12;
                } else expenseAmount = expenseAmount * 12;
                cost += parseFloat(expenseAmount);
            }
            var includeTax = afterTax * parseFloat(this.props.budget.tax_rate);
            afterTax -= includeTax;
            afterTax -= cost;
            var yearly = afterTax.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
            var monthly = (afterTax / 12).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
            var weekly = (afterTax / 48).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
            return React.createElement(
                "div",
                { className: "container", style: { textAlign: "center", marginBottom: 15 + "px" } },
                React.createElement(
                    "div",
                    { className: "row" },
                    React.createElement(
                        "div",
                        { className: "col" },
                        React.createElement(
                            "div",
                            { className: "notification" },
                            React.createElement(
                                "div",
                                { className: "notification_title" },
                                "Yearly aftermath"
                            ),
                            React.createElement(
                                "div",
                                { className: "notification_desc" },
                                "$",
                                yearly
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "col" },
                        React.createElement(
                            "div",
                            { className: "notification" },
                            React.createElement(
                                "div",
                                { className: "notification_title" },
                                "Monthly aftermath"
                            ),
                            React.createElement(
                                "div",
                                { className: "notification_desc", id: "nearEmpty" },
                                "$",
                                monthly
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "col" },
                        React.createElement(
                            "div",
                            { className: "notification" },
                            React.createElement(
                                "div",
                                { className: "notification_title" },
                                "Weekly aftermath"
                            ),
                            React.createElement(
                                "div",
                                { className: "notification_desc", id: "empty" },
                                "$",
                                weekly
                            )
                        )
                    )
                )
            );
        }
    }]);

    return HighLevelMetrics;
}(React.Component);

var ExpenseList = function (_React$Component6) {
    _inherits(ExpenseList, _React$Component6);

    function ExpenseList(props) {
        _classCallCheck(this, ExpenseList);

        var _this12 = _possibleConstructorReturn(this, (ExpenseList.__proto__ || Object.getPrototypeOf(ExpenseList)).call(this, props));

        _this12.state = {
            message: [],
            budget: null
        };
        return _this12;
    }

    _createClass(ExpenseList, [{
        key: "changeTaxRate",
        value: function changeTaxRate() {
            var newTax;
            do {
                newTax = prompt("What is the new tax rate you want? Please enter as percentage (E.G. 0.235 should be 23.5%)");
                if (newTax == null) return;
            } while (isNaN(newTax));
            newTax = parseFloat(newTax);
            newTax = newTax / 100;
            newTax = newTax.toFixed(4);

            fetch("/finance/updateBudgetTax?budgetId=" + this.state.budget.account_id + "&taxRate=" + newTax).then(function (res) {
                return res.json();
            }).then(function (result) {
                location.reload();
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            function (error) {
                alert("Error!");
                console.log(error);
            });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this13 = this;

            eventBus.on("expense", function (data) {
                return _this13.setState({ message: data.message, budget: data.budget });
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
            var _this14 = this;

            var tax_rate = void 0,
                net_income = void 0,
                displayedSalary = void 0;
            if (this.state.budget != null) {
                var salary = parseFloat(this.state.budget.salary);
                tax_rate = parseFloat(this.state.budget.tax_rate) * 100 + "%";
                displayedSalary = salary.toLocaleString('en-US', { maximumFractionDigits: 0 });
                net_income = (salary - salary * parseFloat(this.state.budget.tax_rate)).toLocaleString('en-US', { maximumFractionDigits: 0 });
            }

            return React.createElement(
                "div",
                null,
                this.state.budget != null ? React.createElement(
                    "span",
                    null,
                    React.createElement(
                        "h1",
                        { style: { textAlign: "center", fontWeight: "bolder" } },
                        this.state.budget.account_name
                    ),
                    React.createElement(
                        "h3",
                        { style: { textAlign: "center" } },
                        "Gross income: $",
                        displayedSalary
                    ),
                    React.createElement(
                        "h3",
                        { style: { textAlign: "center" } },
                        "Net income: $",
                        net_income,
                        " "
                    ),
                    React.createElement(
                        "h4",
                        { id: "taxRate" },
                        "Tax rate: ",
                        tax_rate,
                        " ",
                        React.createElement("i", { className: "fa fa-edit editMe", onClick: function onClick() {
                                return _this14.changeTaxRate();
                            } })
                    ),
                    React.createElement(HighLevelMetrics, { data: this.state.message, budget: this.state.budget }),
                    React.createElement(ExpenseFormDropDown, { budgetId: this.state.budget.account_id, budget: this.state.budget }),
                    React.createElement(ExpenseTable, { message: this.state.message, budget: this.state.budget })
                ) : null
            );
        }
    }]);

    return ExpenseList;
}(React.Component);

var Budget = function (_React$Component7) {
    _inherits(Budget, _React$Component7);

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
            var _this16 = this;

            if (confirm("Are you sure you want to delete budget: '" + this.props.data.account_name + "'")) {
                fetch("/finance/deleteBudget?budgetId=" + this.props.data.account_id).then(function (res) {
                    return res.json();
                }).then(function (result) {
                    _this16.props.updateFunction();
                    updateExpenseList(null);
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
            var _this17 = this;

            return React.createElement(
                "a",
                { onClick: function onClick() {
                        return _this17.handleNewReleaseClick(_this17.props.data);
                    } },
                React.createElement(
                    "span",
                    null,
                    this.props.data.account_name
                ),
                React.createElement("i", { className: "fa fa-minus-circle deleteMe", onClick: function onClick() {
                        return _this17.deleteBudget();
                    } })
            );
        }
    }]);

    return Budget;
}(React.Component);

var BudgetList = function (_React$Component8) {
    _inherits(BudgetList, _React$Component8);

    function BudgetList(props) {
        _classCallCheck(this, BudgetList);

        var _this18 = _possibleConstructorReturn(this, (BudgetList.__proto__ || Object.getPrototypeOf(BudgetList)).call(this, props));

        _this18.state = {
            budgetArr: []
        };
        return _this18;
    }

    _createClass(BudgetList, [{
        key: "updateBudgets",
        value: function updateBudgets() {
            var _this19 = this;

            fetch("/finance/budget-list").then(function (res) {
                return res.json();
            }).then(function (result) {
                _this19.setState({ budgetArr: result });
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
            var _this20 = this;

            var getName;
            do {
                getName = prompt("What is the name of the budget?");
                if (getName == null) return;
            } while (getName.trim() == "");
            var getSalary;
            do {
                getSalary = prompt("What is the expected salary? Enter only numbers.");
                if (getSalary == null) return;
            } while (isNaN(getSalary));
            var taxRate;
            if (getSalary < 10000) taxRate = 0.175;else {
                taxRate = parseFloat((0.175 + 0.0075 * Math.round((getSalary - 10000) / 5000)).toFixed(4));
            }

            var data = {
                salary: getSalary,
                accountName: getName,
                taxRate: taxRate
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
                _this20.updateBudgets();
            }, function (error) {
                alert("Error!");
                console.log(error);
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this21 = this;

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
                            React.createElement(Budget, { data: budget, updateFunction: _this21.updateBudgets.bind(_this21) })
                        );
                    })
                ),
                React.createElement(
                    "li",
                    null,
                    React.createElement(
                        "a",
                        { className: "btn btn-success btn-lg sideBarButtons", onClick: function onClick() {
                                return _this21.addBudget();
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