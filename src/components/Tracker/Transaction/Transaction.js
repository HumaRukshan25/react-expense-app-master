import React, { useState } from 'react';
import './Transaction.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Transaction = ({ expense, onEdit, onDelete }) => {
  const [isEditing, setEditing] = useState(false);
  const [updatedExpense, setUpdatedExpense] = useState(expense);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = () => {
    onEdit(expense.id, updatedExpense);
    setEditing(false);
  };

  const handleDelete = () => {
    onDelete(expense.id);
  };

  const handleInputChange = (event) => {
    setUpdatedExpense({
      ...updatedExpense,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className="transactionItem">
      {isEditing ? (
        <>
          <input
            type="text"
            name="description"
            value={updatedExpense.description}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="price"
            value={updatedExpense.price}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="date"
            value={updatedExpense.date}
            onChange={handleInputChange}
          />
          <button className="btn btn-success" onClick={handleSave}>
            Save
          </button>
        </>
      ) : (
        <>
          <div className="totals mt-3">
            <div>Description: {expense.description}</div>
            <div>Price: {expense.price}</div>
            <div>Category: {expense.category}</div>
            <div>Date: {expense.date}</div>
            <button className="btn btn-info" onClick={handleEdit}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Transaction;
