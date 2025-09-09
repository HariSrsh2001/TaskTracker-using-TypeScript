import React, { useState } from "react";
import { Input, Button, makeStyles } from "@fluentui/react-components";
import { createTask } from "../api/client";
import type { CreateTaskDTO } from "../types";

const useStyles = makeStyles({
    formContainer: {
        display: "flex",       // use flexbox layout
        flexWrap: "wrap",      // allow inputs to wrap to next line
        gap: "8px",            // spacing between inputs
        marginBottom: "20px",  // space below the form
    },
});

export function TaskForm() {
    // Local state for form inputs (controlled components)
    const [title, setTitle] = useState("");           // task title
    const [description, setDescription] = useState(""); // task description
    const [assignedTo, setAssignedTo] = useState("");   // assignee name

    const styles = useStyles(); // apply styles

    // Handle form submission
    const handleSubmit = async () => {
        if (!title) return; // simple validation: don't allow empty titles

        // Build DTO object with current state values
        const dto: CreateTaskDTO = { title, description, assignedTo };

        // Call API to create the task (saves in backend + triggers SignalR event)
        await createTask(dto);

        // Clear input fields (reset state)
        // ❌ Do NOT manually update TaskList — SignalR will update tasks in real time
        setTitle("");
        setDescription("");
        setAssignedTo("");
    };

    // Render input fields + button
    return (
        <div className={styles.formContainer}>
            {/* Controlled input for title */}
            <Input
                placeholder="Title"
                value={title}
                onChange={(_, d) => setTitle(d.value)} // update state on typing
            />

            {/* Controlled input for description */}
            <Input
                placeholder="Description"
                value={description}
                onChange={(_, d) => setDescription(d.value)}
            />

            {/* Controlled input for assignedTo */}
            <Input
                placeholder="Assigned To"
                value={assignedTo}
                onChange={(_, d) => setAssignedTo(d.value)}
            />

            {/* Submit button */}
            <Button appearance="primary" onClick={handleSubmit}>
                Add Task
            </Button>
        </div>
    );
}
