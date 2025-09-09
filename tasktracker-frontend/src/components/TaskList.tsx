import React, { useEffect, useState } from "react";
import type { TaskItem } from "../types";
import { getTasks } from "../api/client";
import { startConnection, onTaskCreated, onTaskUpdated, onTaskDeleted } from "../hub/hub";
import { TaskCard } from "./TaskItem";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    listContainer: { display: "flex", flexDirection: "column", gap: "12px" },
});

// Map backend string/number to enum
const mapStatus = (status: string | number): number => {
    switch (status) {
        case "New": case 0: return 0;
        case "InProgress": case 1: return 1;
        case "Completed": case 2: return 2;
        default: return 0;
    }
};

export function TaskList() {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const styles = useStyles();

    useEffect(() => {
        const load = async () => {
            const rawTasks = await getTasks();
            const tasksWithEnum = rawTasks.map(t => ({ ...t, status: mapStatus(t.status) }));
            setTasks(tasksWithEnum);
        };
        load();

        startConnection();

        onTaskCreated(t => {
            const newTask = { ...t, status: mapStatus(t.status) };
            setTasks(prev => prev.some(task => task.id === t.id) ? prev : [...prev, newTask]);
        });

        onTaskUpdated(u => {
            const updatedTask = { ...u, status: mapStatus(u.status) };
            setTasks(prev => prev.map(t => t.id === u.id ? updatedTask : t));
        });

        onTaskDeleted(id => setTasks(prev => prev.filter(t => t.id !== id)));
    }, []);

    // Drag & drop
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => setDraggedTaskId(id);
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedTaskId || draggedTaskId === targetId) return;

        const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
        const targetIndex = tasks.findIndex(t => t.id === targetId);
        const updatedTasks = [...tasks];
        [updatedTasks[draggedIndex], updatedTasks[targetIndex]] = [updatedTasks[targetIndex], updatedTasks[draggedIndex]];
        setTasks(updatedTasks);
        setDraggedTaskId(null);
    };

    return (
        <div className={styles.listContainer}>
            {tasks.map(task => (
                <div
                    key={task.id}
                    draggable
                    onDragStart={e => handleDragStart(e, task.id)}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, task.id)}
                >
                    <TaskCard task={task} />
                </div>
            ))}
        </div>
    );
}
