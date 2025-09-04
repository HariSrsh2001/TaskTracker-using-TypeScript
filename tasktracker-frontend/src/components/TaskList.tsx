import React, { useEffect, useState } from "react";
import type { TaskItem as TaskItemType } from "../types";
import { getTasks } from "../api/client";
import { startConnection, onTaskCreated, onTaskUpdated, onTaskDeleted } from "../hub/hub";
import { TaskCard } from "./TaskItem";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    listContainer: { display: "flex", flexDirection: "column", gap: "12px" }
});

export function TaskList() {
    const [tasks, setTasks] = useState<TaskItemType[]>([]);
    const styles = useStyles();

    useEffect(() => {
        // Initial load
        const load = async () => setTasks(await getTasks());
        load();

        // Start SignalR
        startConnection();

        // TaskCreated: only add if the ID is not already present
        onTaskCreated(t =>
            setTasks(prev => {
                if (prev.some(task => task.id === t.id)) return prev;
                return [...prev, t];
            })
        );

        // TaskUpdated: update existing task
        onTaskUpdated(u =>
            setTasks(prev => prev.map(t => (t.id === u.id ? u : t)))
        );

        // TaskDeleted: remove task
        onTaskDeleted(id =>
            setTasks(prev => prev.filter(t => t.id !== id))
        );
    }, []);

    return (
        <div className={styles.listContainer}>
            {tasks.map(t => (
                <TaskCard key={t.id} task={t} />
            ))}
        </div>
    );
}
