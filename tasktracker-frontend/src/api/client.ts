import axios from "axios";
import type { TaskItem, CreateTaskDTO, TaskStatus } from "../types";

const API_URL = "http://localhost:5023/api/tasks";

export const getTasks = async (): Promise<TaskItem[]> => {
    const response = await axios.get<TaskItem[]>(API_URL);
    return response.data;
};

export const createTask = async (task: CreateTaskDTO): Promise<TaskItem> => {
    const response = await axios.post<TaskItem>(API_URL, task);
    return response.data;
};

// PATCH status: send raw enum value
export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<TaskItem> => {
    const response = await axios.patch<TaskItem>(
        `${API_URL}/${id}/status`,
        status, // send raw number
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
};

// FULL task update
export const updateTask = async (id: string, task: Partial<TaskItem>): Promise<TaskItem> => {
    const response = await axios.put<TaskItem>(`${API_URL}/${id}`, task);
    return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};
