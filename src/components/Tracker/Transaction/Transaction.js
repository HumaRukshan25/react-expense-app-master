import React, { useState } from 'react';

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
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <div>{expense.description}</div>
          <div>{expense.price}</div>
          <div>{expense.date}</div>
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
    </div>
  );
};

export default Transaction;

