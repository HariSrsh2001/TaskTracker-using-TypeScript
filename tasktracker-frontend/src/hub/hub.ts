import * as signalR from "@microsoft/signalr";
import type { TaskItem } from "../types";

let connection: signalR.HubConnection;

export const startConnection = async () => {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5023/taskHub")
        .withAutomaticReconnect()
        .build();

    connection.onreconnected(() => console.log("SignalR Reconnected"));
    connection.onclose(() => console.log("SignalR Disconnected"));

    try {
        await connection.start();
        console.log("SignalR Connected");
    } catch (err) {
        console.error(err);
    }
};

export const onTaskCreated = (callback: (task: TaskItem) => void) => {
    connection.on("TaskCreated", callback);
};

export const onTaskUpdated = (callback: (task: TaskItem) => void) => {
    connection.on("TaskUpdated", callback);
};

export const onTaskDeleted = (callback: (id: string) => void) => {
    connection.on("TaskDeleted", callback);
};
