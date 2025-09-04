import * as signalR from "@microsoft/signalr";
import type { TaskItem } from "../types";

let connection: signalR.HubConnection;

export const startConnection = async () => {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5023/taskHub")
        .withAutomaticReconnect()
        .build();

    connection.onreconnected(() => console.log("SignalR reconnected"));
    connection.onclose(() => console.log("SignalR disconnected"));

    try {
        await connection.start();
        console.log("SignalR Connected");
    } catch (err) {
        console.error("SignalR Error:", err);
    }
};

export const onTaskCreated = (cb: (task: TaskItem) => void) => connection.on("TaskCreated", cb);
export const onTaskUpdated = (cb: (task: TaskItem) => void) => connection.on("TaskUpdated", cb);
export const onTaskDeleted = (cb: (id: string) => void) => connection.on("TaskDeleted", cb);
