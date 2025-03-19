import React, { useState, useEffect } from "react";
import { getAuthenticatedRequest } from "../../utils/authService";
import "../../styles/toDoList/ToDoList.css";
import AddTaskModal from "./CreateNewTask";
import AddListModal from "./CreateNewList";

const ToDoList = ({ isShared, listId = undefined, socket, roomCode }) => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    const [addTaskWindow, setAddTaskWindow] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null);
    const [addListWindow, setAddListWindow] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [expandedTasks, setExpandedTasks] = useState({}); // Tracks expanded tasks


    useEffect(() => {
        const fetchData = async () => {

            try {
                let data;
                if (!isShared) {
                    data = await getAuthenticatedRequest(`/todolists/`);
                } else {
                    data = await getAuthenticatedRequest(`/todolists/${listId}/`);
                }
                setLists(data);
            } catch (error) {
                if (error.response) {
                    alert(error.response.data.error);
                }
                console.error("Error fetching to-do lists:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        if (isShared) {
            const socket = new WebSocket(`ws://localhost:8000/ws/todolist/${roomCode}/`);

            socket.onopen = () => {
                console.log("WebSocket connected");
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);

                    setLists(prevLists => {
                        return prevLists.map(list => {
                            if (list.id !== listId) return list; // Only process the relevant list

                            if (data.type === "remove_task") {
                                return {
                                    ...list,
                                    tasks: list.tasks.filter(task => task.id !== data.task_id)
                                };
                            }

                            if (data.type === "toggle_task") {
                                return {
                                    ...list,
                                    tasks: list.tasks.map(task =>
                                        task.id === data.task_id ? { ...task, is_completed: data.is_completed } : task
                                    )
                                };
                            }

                            if (data.type === "add_task") {
                                if (!list.tasks.some(task => task.id === data.task.id)) {
                                    return {
                                        ...list,
                                        tasks: [...list.tasks, data.task] 
                                    };
                                }
                            }

                            return list;
                        });
                    });
                };

            };
        }

    }, [isShared, listId]);


    const toggleTaskCompletion = async (taskId) => {
        try {
            const task = await getAuthenticatedRequest(`/update_task/${taskId}/`, "PATCH"); 
            
            
            if (isShared && socket.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                    type: "toggle_task",
                    task_id: taskId,
                    is_completed: !task.is_completed, 
                });
                socket.send(message);
            }
            if (!isShared) {
                setLists(prevLists =>
                    prevLists.map(list => ({
                        ...list,
                        tasks: list.tasks.map(task =>
                            task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
                        )
                    }))
                );
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
            console.log(data.data)
            
            if (isShared && socket.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                    type: "remove_task",
                    task_id: taskId,
                });
                socket.send(message);
            } else {
                setLists(prevLists =>
                    prevLists.map(list => ({
                        ...list,
                        tasks: list.tasks.filter(task => task.id !== taskId) // Remove the deleted task from tasks array
                    })))
            }

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

            if (socket && socket.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                    type: "delete_list",
                    list_id: listId,
                });
                socket.send(message);
            }

        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = (listId) => {
        setSelectedListId(listId);
        setAddTaskWindow(true);

        if (isShared && socket.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
                type: "add_task",
                list_id: listId,
            });
            socket.send(message);
        }
    };

    const handleAddList = () => {
        setAddListWindow(true);
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const toggleTaskDetails = (taskId) => {
        setExpandedTasks((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    if (loading) return <div>Loading To-Do Lists...</div>;

    return (
        <div className={isFullScreen ? "todo-container full-screen" : "todo-container"}>
            <div className="todo-header">
                {!isShared ? (
                    <>
                        <h3>To-Do Lists</h3>
                        <div className="header-buttons">
                            <button onClick={handleAddList} className="btn btn-success btn-sm" aria-label="Add List">
                                <i className="bi bi-plus-circle"></i>
                            </button>
                            <button onClick={toggleFullScreen} className="full-screen-btn">
                                {isFullScreen ? (
                                    <>
                                        <i className="bi bi-box-arrow-in-down"></i> Exit View
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-arrows-fullscreen">View All</i>
                                    </>
                                )}
                            </button>
                        </div>
                    </>) : (<></>)
                }
            </div>

            <div className="todo-list">
                {lists.map((list) => (
                    <div className="todo-card" key={list.id}>
                        <div className="todo-card-header">
                            <button onClick={() => handleAddTask(list.id)} className="btn btn-success btn-sm" aria-label="Add Task">
                                <i className="bi bi-plus-circle"></i>
                            </button>
                            {!isShared ? (
                                <button onClick={() => handleDeleteList(list.id)} className="btn btn-danger btn-sm">
                                    <i className="bi bi-trash"></i>
                                </button>
                            ) : (<></>)
                            }
                        </div>

                        <h4>{list.name}</h4>
                        <ul>
                            {list.tasks.map((task) => (
                                <li key={task.id} className="task">
                                    <div className="task-item">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={task.is_completed}
                                            onChange={() => toggleTaskCompletion(task.id)}
                                        />
                                        <span className={task.is_completed ? "completed" : ""}>
                                            {task.title}
                                        </span>

                                        <div className="task-item-buttons">

                                            {/* Delete Task Button */}
                                            <button onClick={() => handleDeleteTask(task.id)} className="btn btn-danger btn-sm">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                            {/* Expand/Collapse Button for Task Details */}
                                            <button onClick={() => toggleTaskDetails(task.id)} className="btn btn-info btn-sm" aria-label="Task Details">
                                                {expandedTasks[task.id] ? (
                                                    <>
                                                        <i className="bi bi-chevron-up"></i> Hide Details
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-chevron-down"></i>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Task Details (Only visible when expanded) */}
                                    {expandedTasks[task.id] && (
                                        <div className="task-details">
                                            <p><strong>Description:</strong> {task.content || "No details available"}</p>
                                        </div>
                                    )}
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
                isShared={ isShared}
            />
            {!isShared ?
                (<AddListModal
                addListWindow={addListWindow}
                setAddListWindow={setAddListWindow}
                setLists={setLists}
                />
                ) : (<></>)
            }
            
        </div>
    );
};

export default ToDoList;