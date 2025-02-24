import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { getAuthenticatedRequest } from "../utils/authService";


const ToDoList = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

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


    const toggleTaskCompletion = (listId, taskId, currentStatus) => {
        // Update task completion status
        /*axios
            .patch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
                is_finished: !currentStatus,
            })
            .then(() => {
                // Update UI after successful API call
                setLists((prevLists) =>
                    prevLists.map((list) =>
                        list.id === listId
                            ? {
                                ...list,
                                tasks: list.tasks.map((task) =>
                                    task.id === taskId
                                        ? { ...task, is_finished: !currentStatus }
                                        : task
                                ),
                            }
                            : list
                    )
                );
            })
            .catch((error) => console.error("Error updating task:", error));*/
    };

    if (loading) return <div>Loading To-Do Lists...</div>;

    return (
        <div className="todo-container">
            <h3>To-Do Lists</h3>
            <div className="todo-list">
                {lists.map((list) => (
                    <div className="todo-card" key={list.id}>
                        <h4>{list.name}</h4>
                        <ul>
                            {list.tasks.map((task) => (
                                <li key={task.id} className="task-item">
                                    <input
                                        type="checkbox"
                                        checked={task.is_finished}
                                        onChange={() =>
                                            toggleTaskCompletion(list.id, task.id, task.is_finished)
                                        }
                                    />
                                    <span className={task.is_finished ? "completed" : ""}>
                                        {task.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );

};

export default ToDoList;
