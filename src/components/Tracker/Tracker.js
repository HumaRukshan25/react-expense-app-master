import React, { Component } from 'react';
import './Tracker.css';
import fire from '../../config/Fire';
import Transaction from './Transaction/Transaction';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import UserProfile from '../Forms/UserProfile';
class Tracker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: fire.auth().currentUser,
      expenses: [],
      description: '',
      price: '',
      date: '',
    };
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleAddExpense = () => {
    const { description, price, date, expenses } = this.state;

    if (description && price && date) {
      const newExpense = {
        id: expenses.length + 1,
        description,
        price,
        date,
      };

      this.setState({
        expenses: [...expenses, newExpense],
        description: '',
        price: '',
        date: '',
      });
    }
  };

  handleEditExpense = (id, updatedExpense) => {
    const { expenses } = this.state;
    const updatedExpenses = expenses.map((expense) =>
      expense.id === id ? { ...expense, ...updatedExpense } : expense
    );

    this.setState({ expenses: updatedExpenses });
  };

  handleDeleteExpense = (id) => {
    const { expenses } = this.state;
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);

    this.setState({ expenses: updatedExpenses });
  };

  getTotalExpenses = () => {
    return this.state.expenses.length;
  };

  getTotalPrice = () => {
    const { expenses } = this.state;
    return expenses.reduce((total, expense) => total + parseFloat(expense.price), 0).toFixed(2);
  };

  logout = () => {
    fire.auth().signOut();
  };

  // tracker.js


  render() {
    const { currentUser, expenses, description, price, date } = this.state;

    return ( 
      <div className="container mt-5 lavender-background">
           <UserProfile/>
        <div className="welcome bg-light p-3 ">
          <span>Hi, {currentUser.displayName}! Welcome to Expense Tracker</span>
          <button className="btn btn-danger ml-2" onClick={this.logout}>
            Exit
          </button>
        </div>
        <div className="expenseForm mt-3">
          <div className="row">
            <div className="col-4">
              <input
                type="text"
                className="form-control"
                name="description"
                value={description}
                placeholder="Description"
                onChange={this.handleInputChange}
              />
            </div>
            <div className="col-3">
              <input
                type="text"
                className="form-control"
                name="price"
                value={price}
                placeholder="Price"
                onChange={this.handleInputChange}
              />
            </div>
            <div className="col-3">
  <input
    type="date"
    className="form-control"
    name="date"
    value={date}
    onChange={this.handleInputChange}
  />

            </div>
            <div className="col-2">
              <button className="btn btn-primary" onClick={this.handleAddExpense}>
                Add Expense
              </button>
            </div>
          </div>
        </div>
        <div className="expenseList mt-3">
          {expenses.map((expense) => (
            <Transaction
              key={expense.id}
              expense={expense}
              onEdit={this.handleEditExpense}
              onDelete={this.handleDeleteExpense}
            />
          ))}
        </div>
        <div className="totals mt-3">
          <div>Total Expenses: {this.getTotalExpenses()}</div>
          <div>Total Price: ${this.getTotalPrice()}</div>
        </div>
     
      </div>
    );
  }
}

export default Tracker;
