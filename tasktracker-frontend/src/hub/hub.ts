import * as signalR from "@microsoft/signalr";
import type { TaskItem } from "../types";

let connection: signalR.HubConnection; // holds the SignalR connection instance

// Start and configure the SignalR connection
export const startConnection = async () => {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5023/taskHub") // backend SignalR hub URL
        .withAutomaticReconnect() // auto reconnect if connection drops
        .build();

    // event when client successfully reconnects
    connection.onreconnected(() => console.log("SignalR Reconnected"));

    // event when client disconnects
    connection.onclose(() => console.log("SignalR Disconnected"));

    try {
        await connection.start(); // establish connection
        console.log("SignalR Connected");
    } catch (err) {
        console.error(err); // log error if connection fails
    }
};

// Listen for "TaskCreated" event from server
export const onTaskCreated = (callback: (task: TaskItem) => void) => {
    connection.on("TaskCreated", callback);
};

// Listen for "TaskUpdated" event from server
export const onTaskUpdated = (callback: (task: TaskItem) => void) => {
    connection.on("TaskUpdated", callback);
};

// Listen for "TaskDeleted" event from server
export const onTaskDeleted = (callback: (id: string) => void) => {
    connection.on("TaskDeleted", callback);
};
