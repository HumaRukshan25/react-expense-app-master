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
      selectedCategory: '',
    };

    // Reference to Firebase Firestore collection
    this.expensesCollection = fire.firestore().collection('expenses');
  }

  componentDidMount() {
    // Load expenses from localStorage
    const storedExpenses = JSON.parse(localStorage.getItem('expenses'));
    if (storedExpenses) {
      this.setState({ expenses: storedExpenses });
    }

    // Fetch expenses from Firebase Firestore
    this.expensesCollection.onSnapshot((snapshot) => {
      const expenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.setState({ expenses });

      // Save expenses to localStorage
      localStorage.setItem('expenses', JSON.stringify(expenses));
    });
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleAddExpense = () => {
    const { description, price, date, selectedCategory } = this.state;

    if (description && price && date && selectedCategory) {
      const newExpense = {
        description,
        price,
        date,
        category: selectedCategory,
      };

      // Add expense to Firebase Firestore
      this.expensesCollection
        .add(newExpense)
        .then((docRef) => {
          // Update local state with the new expense ID
          this.setState(
            (prevState) => ({
              expenses: [
                ...prevState.expenses,
                {
                  id: docRef.id,
                  ...newExpense,
                },
              ],
              description: '',
              price: '',
              date: '',
              selectedCategory: '',
            }),
            // Save expenses to localStorage after updating state
            () => {
              localStorage.setItem('expenses', JSON.stringify(this.state.expenses));
            }
          );
        })
        .catch((error) => {
          console.error('Error adding expense to Firestore:', error);
        });

      // POST request using Firebase Realtime Database REST API
      fetch('https://expense-tracker-db3a0-default-rtdb.firebaseio.com/expenses.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  };

  handleEditExpense = (id, updatedExpense) => {
    // Update expense in Firebase Firestore
    this.expensesCollection
      .doc(id)
      .update(updatedExpense)
      .catch((error) => {
        console.error('Error updating expense in Firestore:', error);
      });
  };

  handleDeleteExpense = (id) => {
    // Delete expense from Firebase Firestore
    this.expensesCollection
      .doc(id)
      .delete()
      .catch((error) => {
        console.error('Error deleting expense from Firestore:', error);
      });
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

  render() {
    const { currentUser, expenses, description, price, date, selectedCategory } = this.state;

    // Sample list of expense categories
    const expenseCategories = ['Food', 'Petrol', 'Salary', 'Other'];

    return (
      <div className="container mt-5 lavender-background">
        <UserProfile />
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
            <div className="col-2">
              <select
                className="form-control"
                name="selectedCategory"
                value={selectedCategory}
                onChange={this.handleInputChange}
              >
                <option value="">Select Category</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-2">
              <input
                type="date"
                className="form-control"
                name="date"
                value={date}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="col-1">
              <button className="btn btn-primary" onClick={this.handleAddExpense}>
                Add
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
