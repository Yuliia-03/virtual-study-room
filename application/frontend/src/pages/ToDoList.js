import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { getAuthenticatedRequest } from "../utils/authService";
import "../styles/ToDoList.css";


const ToDoList = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

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
        const token = localStorage.getItem('access_token');
        axios
            .patch(`http://127.0.0.1:8000/api/update_task/${taskId}/`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(() => {
                fetchData();
            })
            .catch((error) => console.error("Error updating task:", error));
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
                                        checked={task.is_completed}
                                        onChange={() =>
                                            toggleTaskCompletion(list.id, task.id, task.is_completed)
                                        }
                                    />
                                    <span className={task.is_completed ? "completed" : ""}>
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
