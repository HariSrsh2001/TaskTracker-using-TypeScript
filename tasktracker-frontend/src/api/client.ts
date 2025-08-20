import axios from "axios";
import type { TaskItem, CreateTaskDTO, TaskStatus } from "../types";

const API_URL = "http://localhost:5023/api/tasks"; // base URL for the backend API

// Fetch all tasks
export const getTasks = async (): Promise<TaskItem[]> => {
    const response = await axios.get<TaskItem[]>(API_URL);
    return response.data;
};

// Create a new task
export const createTask = async (task: CreateTaskDTO): Promise<TaskItem> => {
    const response = await axios.post<TaskItem>(API_URL, task);
    return response.data;
};

// Update only the status of a task (PATCH)  
// Backend expects the raw enum value (number) in the body
export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<TaskItem> => {
    const response = await axios.patch<TaskItem>(
        `${API_URL}/${id}/status`,
        status, // send as plain number
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
};

// Update a full task (title, description, assignedTo, etc.)
export const updateTask = async (id: string, task: Partial<TaskItem>): Promise<TaskItem> => {
    const response = await axios.put<TaskItem>(`${API_URL}/${id}`, task);
    return response.data;
};

// Delete a task by ID
export const deleteTask = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};
