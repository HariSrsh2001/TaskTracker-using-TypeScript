// Import SignalR client library
import * as signalR from "@microsoft/signalr";
// Import TaskItem type for type safety
import type { TaskItem } from "../types";

// Declare connection variable (shared across functions)
let connection: signalR.HubConnection;

// ---------------------- START CONNECTION ----------------------
export const startConnection = async () => {
    // 1. Create a new HubConnectionBuilder
    connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5023/taskHub") // backend hub URL
        .withAutomaticReconnect() // auto-reconnect on lost connection
        .build();

    // 2. Setup event listeners for connection state changes
    connection.onreconnected(() => console.log("SignalR reconnected"));
    connection.onclose(() => console.log("SignalR disconnected"));

    // 3. Try to start the connection
    try {
        await connection.start();
        console.log("SignalR Connected");
    } catch (err) {
        console.error("SignalR Error:", err);
    }
};

// ---------------------- TASK EVENTS ----------------------

// Triggered when server broadcasts "TaskCreated"
// Calls provided callback with new TaskItem
export const onTaskCreated = (cb: (task: TaskItem) => void) =>
    connection.on("TaskCreated", cb);

// Triggered when server broadcasts "TaskUpdated"
// Calls provided callback with updated TaskItem
export const onTaskUpdated = (cb: (task: TaskItem) => void) =>
    connection.on("TaskUpdated", cb);

// Triggered when server broadcasts "TaskDeleted"
// Calls provided callback with task ID
export const onTaskDeleted = (cb: (id: string) => void) =>
    connection.on("TaskDeleted", cb);
