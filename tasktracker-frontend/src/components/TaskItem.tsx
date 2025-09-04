import React from "react";
import {
    Card,
    Button,
    Text,
    makeStyles,
} from "@fluentui/react-components";
import { TaskItem, TaskStatus } from "../types";
import { updateTaskStatus, deleteTask } from "../api/client";

const useStyles = makeStyles({
    cardBody: {
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px", // ensures even spacing between all rows
    },
    actions: {
        display: "flex",
        gap: "8px",
        marginTop: "12px",
    },
    select: {
        padding: "6px",
        borderRadius: "4px",
        border: "1px solid #ccc",
    },
    label: {
        fontWeight: 600,
        marginRight: "6px",
    },
});

export function TaskCard({ task }: { task: TaskItem }) {
    const styles = useStyles();

    const handleStatus = (statusStr: string) => {
        const status = TaskStatus[statusStr as keyof typeof TaskStatus];
        updateTaskStatus(task.id, status);
    };

    return (
        <Card>
            <div className={styles.cardBody}>
                {/* Title */}
                <Text>
                    <span className={styles.label}>Title:</span> {task.title}
                </Text>

                {/* Description */}
                <Text>
                    <span className={styles.label}>Description:</span> {task.description}
                </Text>

                {/* Assigned To */}
                <Text>
                    <span className={styles.label}>Assigned To:</span> {task.assignedTo}
                </Text>

                {/* Status */}
                <label>
                    <span className={styles.label}>Status:</span>
                    <select
                        className={styles.select}
                        value={TaskStatus[task.status]}
                        onChange={(e) => handleStatus(e.target.value)}
                    >
                        <option value="New">New</option>
                        <option value="InProgress">InProgress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </label>

                {/* Actions */}
                <div className={styles.actions}>
                    <Button
                        appearance="secondary"
                        onClick={() => deleteTask(task.id)}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Card>
    );
}
