import React, { useEffect, useState } from "react";
import type { TaskItem, CreateTaskDTO } from "./types";
import { TaskStatus } from "./types";

import { getTasks, createTask, updateTaskStatus, deleteTask, updateTask } from "./api/client";
import { startConnection, onTaskCreated, onTaskUpdated, onTaskDeleted } from "./hub/hub";

const App: React.FC = () => {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ title: string; description: string; assignedTo: string }>({
        title: "",
        description: "",
        assignedTo: "",
    });

    useEffect(() => {
        const loadTasks = async () => {
            const data = await getTasks();
            setTasks(data);
        };

        loadTasks();
        startConnection();

        onTaskCreated((task) =>
            setTasks(prev => {
                if (prev.some(t => t.id === task.id)) return prev;
                return [...prev, task];
            })
        );

        onTaskUpdated((updated) =>
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
        );

        onTaskDeleted((id) =>
            setTasks(prev => prev.filter(t => t.id !== id))
        );
    }, []);

    const handleAddTask = async () => {
        if (!title || !assignedTo) return;
        const newTask: CreateTaskDTO = { title, description, assignedTo };
        try {
            await createTask(newTask);
            setTitle(""); setDescription(""); setAssignedTo("");
        } catch (err) {
            console.error("Add Task Error:", err);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);
        } catch (err) {
            console.error("Update Status Error:", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTask(id);
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    const handleEditClick = (task: TaskItem) => {
        setEditingTaskId(task.id);
        setEditValues({ title: task.title, description: task.description, assignedTo: task.assignedTo });
    };

    const handleEditSave = async (taskId: string) => {
        try {
            await updateTask(taskId, editValues);
            setEditingTaskId(null);
        } catch (err) {
            console.error("Update Task Error:", err);
        }
    };

    return (
        <div style={{ padding: 20, fontFamily: "sans-serif" }}>
            <h1>Real-Time Task Tracker</h1>

            {/* Task Form */}
            <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", maxWidth: 400 }}>
                <input
                    style={{ marginBottom: 10, padding: 8 }}
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <input
                    style={{ marginBottom: 10, padding: 8 }}
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <input
                    style={{ marginBottom: 10, padding: 8 }}
                    placeholder="Assigned To"
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                />
                <button onClick={handleAddTask} style={{ padding: 10, cursor: "pointer" }}>
                    Add Task
                </button>
            </div>

            {/* Task List */}
            <ul style={{ listStyle: "none", padding: 0 }}>
                {tasks.map(task => (
                    <li key={task.id} style={{ marginBottom: 15, border: "1px solid #ccc", padding: 10, borderRadius: 6 }}>
                        {editingTaskId === task.id ? (
                            <>
                                <input
                                    style={{ marginBottom: 5, padding: 5 }}
                                    value={editValues.title}
                                    onChange={e => setEditValues(prev => ({ ...prev, title: e.target.value }))}
                                />
                                <input
                                    style={{ marginBottom: 5, padding: 5 }}
                                    value={editValues.description}
                                    onChange={e => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                                />
                                <input
                                    style={{ marginBottom: 5, padding: 5 }}
                                    value={editValues.assignedTo}
                                    onChange={e => setEditValues(prev => ({ ...prev, assignedTo: e.target.value }))}
                                />
                                <button onClick={() => handleEditSave(task.id)} style={{ marginRight: 10 }}>Save</button>
                                <button onClick={() => setEditingTaskId(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <div><b>Title:</b> {task.title}</div>
                                <div>Assigned to: {task.assignedTo}</div>
                                <div>Description: {task.description}</div>
                                <div>
                                    <label>Status: </label>
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task.id, Number(e.target.value))}
                                    >
                                        <option value={TaskStatus.New}>New</option>
                                        <option value={TaskStatus.InProgress}>InProgress</option>
                                        <option value={TaskStatus.Completed}>Completed</option>
                                    </select>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        style={{ marginLeft: 10, cursor: "pointer" }}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => handleEditClick(task)}
                                        style={{ marginLeft: 10, cursor: "pointer" }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
