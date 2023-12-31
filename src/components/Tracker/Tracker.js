import React, { Component } from 'react';
import './Tracker.css';
import fire from '../../config/Fire';
import Transaction from './Transaction/Transaction';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserProfile from '../Forms/UserProfile';
import themeReducer from './themeReducer'; // Update the path accordingly

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
      darkMode: false,
      isPremiumActivated: false, // Added premium activation state
    };

    // Reference to Firebase Firestore collection
    this.expensesCollection = fire.firestore().collection('expenses');
  }

  componentDidMount() {
    // Attach the onSnapshot listener and save the unsubscribe function
    this.unsubscribe = this.expensesCollection.onSnapshot((snapshot) => {
      const expenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.setState({ expenses });
    });

    // Fetch expenses from Firebase Firestore when the page is refreshed
    window.addEventListener('beforeunload', this.handlePageRefresh);
  }
 // Handle page refresh
 handlePageRefresh = () => {
  // Fetch expenses from Firebase Firestore
  this.expensesCollection.get().then((snapshot) => {
    const expenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    this.setState({ expenses });
  });
};

componentWillUnmount() {
  // Detach the onSnapshot listener when the component is unmounted
  this.unsubscribe && this.unsubscribe();
  // Remove the event listener when the component is unmounted
  window.removeEventListener('beforeunload', this.handlePageRefresh);
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
        this.setState((prevState) => ({
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
        }));
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

  // ... (unchanged methods)

  handleActivatePremium = () => {
    const totalExpenses = parseFloat(this.getTotalPrice());
    const premiumThreshold = 10000;

    if (totalExpenses >= premiumThreshold) {
      this.setState({ isPremiumActivated: true });
      // Additional actions related to premium activation can be added here
    } else {
      alert("Total expenses must be at least Rs 10000 to activate Premium.");
    }
  };

  toggleDarkMode = () => {
    this.setState((prevState) => ({ darkMode: !prevState.darkMode }));
  };

  handleDownloadCSV = () => {
    const { expenses } = this.state;

    // Convert expenses to CSV format
    const csvContent = "data:text/csv;charset=utf-8," +
      "Description,Price,Category,Date\n" +
      expenses.map(expense =>
        `${expense.description},${expense.price},${expense.category},${expense.date}`
      ).join("\n");

    // Create a Blob and initiate download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
  };

  componentWillUnmount() {
    // Detach the onSnapshot listener when the component is unmounted
    this.unsubscribe && this.unsubscribe();
    // Remove the event listener when the component is unmounted
    window.removeEventListener('beforeunload', this.handlePageRefresh);
  }

  render() {
    const { currentUser, expenses, description, price, date, selectedCategory, darkMode, isPremiumActivated } = this.state;

    // Sample list of expense categories
    const expenseCategories = ['Food', 'Petrol', 'Salary', 'Other'];

    return (
      <div className={`container mt-5 ${darkMode ? 'dark-theme' : 'light-theme'}`}>
        <UserProfile />
        <div className="welcome bg-light p-3 ">
          <span>Hi, {currentUser.displayName}! Welcome to Expense Tracker</span>
          <button className="btn btn-danger ml-2" onClick={this.logout}>
            Exit
          </button>
          {!isPremiumActivated && (
            <button className="btn btn-success ml-2" onClick={this.handleActivatePremium}>
              Activate Premium
            </button>
          )}
          
          {isPremiumActivated && (
          <>
            
            <button className="btn btn-secondary ml-2" onClick={this.toggleDarkMode}>
            Toggle Dark Mode
          </button>
          <button className="btn btn-info ml-2" onClick={this.handleDownloadCSV}>
            Download CSV
          </button>
          </>
        )}
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
