import React, { useState } from "react";
import "../styles/CreateNewTask.css";
import axios from "axios";

import { getAuthenticatedRequest } from "../utils/authService";

const AddTaskModal = ({ showModal, setShowModal, listId }) => {
    // State to manage form data
    const [formData, setFormData] = useState({ list_id: listId, taskTitle: "", taskContent: "" });

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const newTask = {
            title: formData.taskTitle,
            content: formData.taskContent,
            listId
        };

        // Call the passed function to save task
        handleSaveTask(newTask);

        // Reset form data
        setFormData({ taskTitle: "", taskContent: "" });
    };

    // Handle input field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Save task function
    const handleSaveTask = async (newTask) => {
        console.log("Saving task to list", newTask.listId, "Task:", newTask.title, "Content:", newTask.content);

        try {
            const response = await getAuthenticatedRequest("/new_task/", "POST", {
                list_id: newTask.listId,
                title: newTask.title,
                content: newTask.content
            });

            alert(response.message); // Show success message
            setShowModal(false); // Close modal after saving
        } catch (error) {
            if (error.response) {
                alert(error.response.data.error);
            } else {
                //console.error("Signup error:", error);
                alert("An error occurred. Please try again.");
            }   
        }
    };


    // Cancel the action and close the modal
    const handleCancel = () => {
        setFormData({ taskTitle: "", taskContent: "" });
        setShowModal(false);
    };

    // If showModal is false, don't render the modal
    if (!showModal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h4>Add Task</h4>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="taskTitle"
                        value={formData.taskTitle}
                        onChange={handleChange}
                        placeholder="Enter task title"
                        required
                    />
                    <textarea
                        name="taskContent" 
                        value={formData.taskContent}
                        onChange={handleChange}
                        placeholder="Enter task content"
                        required
                        rows="4"
                    ></textarea>

                    <div>
                        <button type="submit" className="btn btn-primary">Save</button>
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;
