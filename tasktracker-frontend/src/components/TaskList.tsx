import React, { useEffect, useState } from "react";
import type { TaskItem } from "../types";
import { getTasks } from "../api/client";
import { startConnection, onTaskCreated, onTaskUpdated, onTaskDeleted } from "../hub/hub";
import { TaskCard } from "./TaskItem";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    listContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
});

export function TaskList() {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const styles = useStyles();

    useEffect(() => {
        const load = async () => setTasks(await getTasks());
        load();

        startConnection();

        onTaskCreated((t) =>
            setTasks((prev) => (prev.some((task) => task.id === t.id) ? prev : [...prev, t]))
        );

        onTaskUpdated((u) =>
            setTasks((prev) => prev.map((t) => (t.id === u.id ? u : t)))
        );

        onTaskDeleted((id) =>
            setTasks((prev) => prev.filter((t) => t.id !== id))
        );
    }, []);

    // Drag & drop handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedTaskId(id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedTaskId || draggedTaskId === targetId) return;

        const draggedIndex = tasks.findIndex((t) => t.id === draggedTaskId);
        const targetIndex = tasks.findIndex((t) => t.id === targetId);

        const updatedTasks = [...tasks];
        const temp = updatedTasks[draggedIndex];
        updatedTasks[draggedIndex] = updatedTasks[targetIndex];
        updatedTasks[targetIndex] = temp;

        setTasks(updatedTasks);
        setDraggedTaskId(null);
    };

    return (
        <div className={styles.listContainer}>
            {tasks.map((task) => (
                <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, task.id)}
                >
                    <TaskCard task={task} />
                </div>
            ))}
        </div>
    );
}
