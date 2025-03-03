import React, { useState, useEffect } from "react";
import { getAuthenticatedRequest } from "../utils/authService";
import "../styles/ToDoList.css";
import AddTaskModal from "./CreateNewTask";
import AddListModal from "./CreateNewList";

const ToDoList = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    const [addTaskWindow, setAddTaskWindow] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null);


    const [addListWindow, setAddListWindow] = useState(false);

    useEffect(() => {

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

    const handleDeleteList = async (listId) => {
        try {
            const data = await getAuthenticatedRequest(`/delete_list/${listId}/`, "DELETE");
            setLists(data);
        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = (listId) => {
        console.log("Opening Add Task Modal for list ID:", listId);  // Check if this log appears in the console

        setSelectedListId(listId); // Set the selected list id
        setAddTaskWindow(true); // Open the modal
    };

    const handleAddList = () => {
        setAddListWindow(true); // Open the modal
    };
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    if (loading) return <div>Loading To-Do Lists...</div>;

    return (
        <div className="todo-container">
            <div className="todo-header">
                <h3>To-Do Lists</h3>
                <div className="header-buttons">
                    <button onClick={() => handleAddList()} className="btn btn-success btn-sm">
                        <i className="bi bi-plus-circle"></i>
                    </button>
                    <button onClick={toggleFullScreen} className="full-screen-btn">
                        <i className="bi bi-arrows-fullscreen"></i> View All
                    </button>
                </div>
            </div>

            <div className="todo-list">
                {lists.map((list) => (
                    <div className="todo-card" key={list.id}>
                        {/* Buttons for Add Task and Delete List */}
                        <div className="todo-card-header">
                            <button onClick={() => handleAddTask(list.id)} className="btn btn-success btn-sm">
                                <i className="bi bi-plus-circle"></i>
                            </button>
                            
                            <button onClick={() =>  handleDeleteList(list.id)} className="btn btn-danger btn-sm">
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
                addTaskWindow={addTaskWindow}
                setAddTaskWindow={setAddTaskWindow}
                listId={selectedListId}
                setLists={setLists}
            />


            <AddListModal
                addListWindow={addListWindow}
                setAddListWindow={setAddListWindow}
                setLists={setLists}
            />
        </div>
        
    );

};

export default ToDoList;
