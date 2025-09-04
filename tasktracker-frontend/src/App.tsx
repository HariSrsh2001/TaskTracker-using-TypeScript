import React from "react";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { PlayerPage } from "./pages/PlayerPage";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    container: {
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "40px"
    },
    section: { display: "flex", flexDirection: "column", gap: "16px" },
    heading: { margin: 0 }
});

export default function App() {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <section className={styles.section}>
                <h1 className={styles.heading}>📋 Task Manager</h1>
                <TaskForm />
                <TaskList />
            </section>
            <section className={styles.section}>
                <h1 className={styles.heading}>🎥 Video Player</h1>
                <PlayerPage />
            </section>
        </div>
    );
}
