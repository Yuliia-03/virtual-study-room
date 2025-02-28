import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuthenticatedRequest } from "../utils/authService";
import "../styles/ToDoList.css";
import AddTaskModal from "./CreateNewTask";

const ToDoList = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null);

    const fetchData = async () => {
        try {
            const data = await getAuthenticatedRequest("/todolists/false/");
            setLists(data);
        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchData();
    }, []);



    const toggleTaskCompletion = async (taskId) => {
        try {
            const response = await getAuthenticatedRequest(`/update_task/${taskId}/`, "PATCH");

            if (response.status === 0) {
                console.error("Error updating task status");
            } else {
                setLists(prevLists => prevLists.map(list => ({
                    ...list,
                    tasks: list.tasks.map(task => task.id === taskId ? { ...task, is_completed: !task.is_completed } : task)
                })));
                console.log("Task status updated successfully");
            }
        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const data = await getAuthenticatedRequest(`/delete_task/${taskId}/`, "DELETE");
            setLists(data);
        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = (listId) => {
        setSelectedListId(listId); // Set the selected list id
        setShowModal(true); // Open the modal
    };


    if (loading) return <div>Loading To-Do Lists...</div>;

    return (
        <div className="todo-container">
            <h3>To-Do Lists</h3>
            <button onClick={() => {/*handleAddList(list.id)*/ }} className="btn btn-success btn-sm">
                <i className="bi bi-plus-circle"></i> {/* Plus Icon from Bootstrap Icons */}
            </button>
            <div className="todo-list">
                {lists.map((list) => (
                    <div className="todo-card" key={list.id}>
                        {/* Buttons for Add Task and Delete List */}
                        <div className="todo-card-header">
                            <button onClick={() => handleAddTask(list.id)} className="btn btn-success btn-sm">
                                <i className="bi bi-plus-circle"></i> {/* Plus Icon from Bootstrap Icons */}
                            </button>
                            
                            <button onClick={() => {/* handleDeleteList(list.id) */}} className="btn btn-danger btn-sm">
                                <i className="bi bi-trash"></i> {/* Trash Icon from Bootstrap Icons */}
                            </button>
                        </div>

                        <h4>{list.name}</h4>
                        <ul>
                            {list.tasks.map((task) => (
                                <li key={task.id} className="task-item">
                                    <input
                                        type="checkbox"
                                        checked={task.is_completed}
                                        onChange={() => toggleTaskCompletion(task.id)}
                                    />
                                    <span className={task.is_completed ? "completed" : ""}>
                                        {task.title}
                                    </span>
                                    <button onClick={() => handleDeleteTask(task.id)} className="btn btn-danger btn-sm">
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

            </div>
            <AddTaskModal
                showModal={showModal}
                setShowModal={setShowModal}
                listId={selectedListId}
                setLists={setLists}
            />
        </div>
        
    );

};

export default ToDoList;
