import React, { useState } from "react";
import "../../styles/toDoList/CreateNewList.css";

import { getAuthenticatedRequest } from "../../utils/authService";

const AddListModal = ({ addListWindow, setAddListWindow, setLists }) => {
  const [formData, setFormData] = useState({ name: "", isShared: false });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveList(formData);
    setFormData({ name: "", isShared: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveList = async (newList) => {
    console.log("Saving list with data:", newList);
    try {
      const response = await getAuthenticatedRequest("/new_list/", "POST", {
        name: newList.name,
        is_shared: newList.isShared,
      });
      // Add the new list, including an empty 'tasks' array
      const newListWithTasks = {
        id: response.listId, // Use the returned listId
        name: response.name, // Use the returned name
        is_shared: response.isShared, // Use the returned isShared
        tasks: [], // Initialize tasks as an empty array
      };

      setLists((prevLists) => [...prevLists, newListWithTasks]);
      setAddListWindow(false);
      console.log("List Created:", response);
    } catch (error) {
      if (error.response) {
        alert(error.response.data.error);
      } else {
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", isShared: false });
    setAddListWindow(false);
  };

  if (!addListWindow) return null;
  return (
    <div role="dialog" className="modal-overlay">
      <div className="modal-content">
        <h2>Add List</h2>
        <div className="form-class">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>List Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter list name"
                required
              />
            </div>
            <div className="button-group">
              <button type="submit" className="btn-save">
                Save
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListModal;
