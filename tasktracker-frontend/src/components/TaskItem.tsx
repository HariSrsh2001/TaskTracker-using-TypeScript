import React, { useState } from "react";
import { Card, Button, Text, Input, makeStyles, tokens } from "@fluentui/react-components";
import { TaskItem, TaskStatus } from "../types";
import { updateTaskStatus, deleteTask, updateTask } from "../api/client";

const useStyles = makeStyles({
    cardBody: {
        padding: tokens.spacingVerticalM,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
        cursor: "grab", // drag & drop still works
    },
    actions: {
        display: "flex",
        gap: tokens.spacingHorizontalS,
        marginTop: tokens.spacingVerticalS,
    },
    input: {
        padding: tokens.spacingVerticalXS,
        borderRadius: tokens.borderRadiusSmall,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    label: {
        fontWeight: 600,
        marginRight: tokens.spacingHorizontalXS,
    },
    deleteButton: {
        backgroundColor: tokens.colorPaletteRedBackground3,
        color: tokens.colorNeutralForegroundInverted,
        "&:hover": { backgroundColor: tokens.colorPaletteRedBackground2 },
    },
    editButton: {
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorNeutralForegroundInverted,
        "&:hover": { backgroundColor: tokens.colorBrandBackgroundHover },
    },
    statusNew: { backgroundColor: "#0078d4", color: "white" },
    statusInProgress: { backgroundColor: "#ffb900", color: "black" },
    statusCompleted: { backgroundColor: "#107c10", color: "white" },
});

const getStatusClass = (status: TaskStatus, styles: ReturnType<typeof useStyles>) => {
    switch (status) {
        case TaskStatus.New: return styles.statusNew;
        case TaskStatus.InProgress: return styles.statusInProgress;
        case TaskStatus.Completed: return styles.statusCompleted;
        default: return "";
    }
};

export function TaskCard({ task }: { task: TaskItem }) {
    const styles = useStyles();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [assignedTo, setAssignedTo] = useState(task.assignedTo);

    const handleStatus = (statusStr: string) => {
        const status = TaskStatus[statusStr as keyof typeof TaskStatus];
        updateTaskStatus(task.id, status);
    };

    const handleSave = async () => {
        await updateTask(task.id, { title, description, assignedTo });
        updateTaskStatus(task.id, TaskStatus.New); // reset status to New (blue) after edit
        setIsEditing(false);
    };

    return (
        <Card className={getStatusClass(task.status, styles)}>
            <div className={styles.cardBody}>
                {isEditing ? (
                    <>
                        <Input className={styles.input} value={title} onChange={(_, d) => setTitle(d.value)} />
                        <Input className={styles.input} value={description} onChange={(_, d) => setDescription(d.value)} />
                        <Input className={styles.input} value={assignedTo} onChange={(_, d) => setAssignedTo(d.value)} />
                    </>
                ) : (
                    <>
                        <Text><span className={styles.label}>Title:</span> {task.title}</Text>
                        <Text><span className={styles.label}>Description:</span> {task.description}</Text>
                        <Text><span className={styles.label}>Assigned To:</span> {task.assignedTo}</Text>
                    </>
                )}

                <label>
                    <span className={styles.label}>Status:</span>
                    <select
                        className={styles.input}
                        value={TaskStatus[task.status]}
                        onChange={(e) => handleStatus(e.target.value)}
                        disabled={isEditing} // cannot change status while editing
                    >
                        <option value="New">New</option>
                        <option value="InProgress">InProgress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </label>

                <div className={styles.actions}>
                    {isEditing ? (
                        <Button className={styles.editButton} onClick={handleSave}>Save</Button>
                    ) : (
                        <Button className={styles.editButton} onClick={() => setIsEditing(true)}>Edit</Button>
                    )}
                    <Button className={styles.deleteButton} onClick={() => deleteTask(task.id)}>Delete</Button>
                </div>
            </div>
        </Card>
    );
}
