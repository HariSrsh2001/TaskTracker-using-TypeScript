import axios from "axios";
import type { TaskItem, CreateTaskDTO, TaskStatus } from "../types";

const API_URL = "http://localhost:5023/api/tasks";

export const getTasks = async (): Promise<TaskItem[]> => {
    const res = await axios.get<TaskItem[]>(API_URL);
    return res.data;
};

export const createTask = async (task: CreateTaskDTO): Promise<TaskItem> => {
    const res = await axios.post<TaskItem>(API_URL, task);
    return res.data;
};

export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<TaskItem> => {
    const res = await axios.patch<TaskItem>(`${API_URL}/${id}/status`, status, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
};

export const updateTask = async (id: string, task: Partial<TaskItem>): Promise<TaskItem> => {
    const res = await axios.put<TaskItem>(`${API_URL}/${id}`, task);
    return res.data;
};

export const deleteTask = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};
