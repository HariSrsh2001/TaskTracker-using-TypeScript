import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { getTasks, createTask } from "./client";
import type { TaskItem, CreateTaskDTO } from "../types";

const mock = new MockAdapter(axios);

describe("Task API client", () => {
    it("fetches tasks", async () => {
        const fakeTasks: TaskItem[] = [
            {
                id: "1",
                title: "Test Task",
                description: "Unit test",
                assignedTo: "Dev",
                status: 0,
                createdAt: "2025-09-01T00:00:00Z",
                modified: "2025-09-01T00:00:00Z",
            }
        ];

        mock.onGet("http://localhost:5023/api/tasks").reply(200, fakeTasks);

        const tasks = await getTasks();
        expect(tasks).toHaveLength(1);
        expect(tasks[0].title).toBe("Test Task");
    });

    it("creates a task", async () => {
        const dto: CreateTaskDTO = { title: "New Task", description: "Desc", assignedTo: "User" };
        const created: TaskItem = {
            id: "2",
            ...dto,
            status: 0,
            createdAt: "2025-09-01T00:00:00Z",
            modified: "2025-09-01T00:00:00Z",
        };

        mock.onPost("http://localhost:5023/api/tasks").reply(200, created);

        const result = await createTask(dto);
        expect(result.id).toBe("2");
        expect(result.title).toBe("New Task");
    });
});
