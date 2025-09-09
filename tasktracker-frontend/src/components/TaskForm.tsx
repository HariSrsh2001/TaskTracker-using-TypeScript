import React, { useState } from "react";
import { Input, Button, makeStyles } from "@fluentui/react-components";
import { createTask } from "../api/client";
import type { CreateTaskDTO } from "../types";

const useStyles = makeStyles({
    formContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "20px",
    },
});

export function TaskForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");

    const styles = useStyles();

    const handleSubmit = async () => {
        if (!title) return;

        const dto: CreateTaskDTO = { title, description, assignedTo };
        await createTask(dto);

        // Reset inputs
        setTitle("");
        setDescription("");
        setAssignedTo("");
    };

    return (
        <div className={styles.formContainer}>
            <Input placeholder="Title" value={title} onChange={(_, d) => setTitle(d.value)} />
            <Input placeholder="Description" value={description} onChange={(_, d) => setDescription(d.value)} />
            <Input placeholder="Assigned To" value={assignedTo} onChange={(_, d) => setAssignedTo(d.value)} />
            <Button appearance="primary" onClick={handleSubmit}>Add Task</Button>
        </div>
    );
}
