import React, { useEffect, useState } from "react";
import type { TaskItem, CreateTaskDTO } from "./types";
import { TaskStatus } from "./types";

import { getTasks, createTask, updateTaskStatus, deleteTask, updateTask } from "./api/client";
import { startConnection, onTaskCreated, onTaskUpdated, onTaskDeleted } from "./hub/hub";

import "./App.css";

const App: React.FC = () => {
    // state for all tasks
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    // states for creating new task
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    // state for editing an existing task
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ title: string; description: string; assignedTo: string }>({
        title: "",
        description: "",
        assignedTo: "",
    });

    useEffect(() => {
        // fetch tasks initially
        const loadTasks = async () => {
            const data = await getTasks();
            setTasks(data);
        };
        loadTasks();

        // start real-time connection (SignalR/WebSocket)
        startConnection();

        // when a task is created, update local state
        onTaskCreated((task) =>
            setTasks(prev => {
                if (prev.some(t => t.id === task.id)) return prev; // avoid duplicates
                return [...prev, task];
            })
        );

        // when a task is updated, replace it in local state
        onTaskUpdated((updated) =>
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
        );

        // when a task is deleted, remove it from local state
        onTaskDeleted((id) =>
            setTasks(prev => prev.filter(t => t.id !== id))
        );
    }, []);

    // add a new task
    const handleAddTask = async () => {
        if (!title || !assignedTo) return; // must have title + assignee
        const newTask: CreateTaskDTO = { title, description, assignedTo };
        try {
            await createTask(newTask); // server will trigger onTaskCreated
            setTitle(""); setDescription(""); setAssignedTo(""); // reset form
        } catch (err) {
            console.error("Add Task Error:", err);
        }
    };

    // change task status (New/InProgress/Completed)
    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);
        } catch (err) {
            console.error("Update Status Error:", err);
        }
    };

    // delete task
    const handleDelete = async (id: string) => {
        try {
            await deleteTask(id);
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    // enable editing mode for a task
    const handleEditClick = (task: TaskItem) => {
        setEditingTaskId(task.id);
        setEditValues({ title: task.title, description: task.description, assignedTo: task.assignedTo });
    };

    // save edited task
    const handleEditSave = async (taskId: string) => {
        try {
            await updateTask(taskId, editValues); // server will trigger onTaskUpdated
            setEditingTaskId(null); // exit edit mode
        } catch (err) {
            console.error("Update Task Error:", err);
        }
    };

    return (
        <div className="app-container">
            <h1>Real-Time Task Tracker</h1>

            {/* Task creation form */}
            <div className="task-form">
                <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <input placeholder="Assigned To" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} />
                <button onClick={handleAddTask}>Add Task</button>
            </div>

            {/* Task list */}
            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task.id} className="task-item">
                        {editingTaskId === task.id ? (
                            // edit mode UI
                            <>
                                <input value={editValues.title} onChange={e => setEditValues(prev => ({ ...prev, title: e.target.value }))} />
                                <input value={editValues.description} onChange={e => setEditValues(prev => ({ ...prev, description: e.target.value }))} />
                                <input value={editValues.assignedTo} onChange={e => setEditValues(prev => ({ ...prev, assignedTo: e.target.value }))} />
                                <div className="task-actions">
                                    <button className="save" onClick={() => handleEditSave(task.id)}>Save</button>
                                    <button className="cancel" onClick={() => setEditingTaskId(null)}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            // view mode UI
                            <>
                                <div><b>Title:</b> {task.title}</div>
                                <div><b>Description:</b> {task.description}</div>
                                <div><b>Assigned to:</b> {task.assignedTo}</div>
                                <div className="task-actions">
                                    {/* change status dropdown */}
                                    <select value={task.status} onChange={(e) => handleStatusChange(task.id, Number(e.target.value))}>
                                        <option value={TaskStatus.New}>New</option>
                                        <option value={TaskStatus.InProgress}>InProgress</option>
                                        <option value={TaskStatus.Completed}>Completed</option>
                                    </select>
                                    {/* delete & edit buttons */}
                                    <button className="delete" onClick={() => handleDelete(task.id)}>Delete</button>
                                    <button className="edit" onClick={() => handleEditClick(task)}>Edit</button>
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
