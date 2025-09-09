// Import axios (to mock network requests)
import axios from "axios";
// Import MockAdapter (to fake API responses for axios)
import MockAdapter from "axios-mock-adapter";
// Import the client functions we want to test
import { getTasks, createTask } from "./client";
// Import types for safety
import type { TaskItem, CreateTaskDTO } from "../types";

// Create a mock adapter for axios (intercepts HTTP requests)
const mock = new MockAdapter(axios);

// Group tests under "Task API client"
describe("Task API client", () => {
    // ------------------ TEST: getTasks ------------------
    it("fetches tasks", async () => {
        // Fake data (what server would return)
        const fakeTasks: TaskItem[] = [
            {
                id: "1",
                title: "Test Task",
                description: "Unit test",
                assignedTo: "Dev",
                status: 0, // New
                createdAt: "2025-09-01T00:00:00Z",
                modified: "2025-09-01T00:00:00Z",
            }
        ];

        // Mock GET /api/tasks → respond with fakeTasks
        mock.onGet("http://localhost:5023/api/tasks").reply(200, fakeTasks);

        // Call the actual client function
        const tasks = await getTasks();

        // Assert that one task is returned
        expect(tasks).toHaveLength(1);
        // Assert that title matches
        expect(tasks[0].title).toBe("Test Task");
    });

    // ------------------ TEST: createTask ------------------
    it("creates a task", async () => {
        // Fake input DTO (what we send to server)
        const dto: CreateTaskDTO = { title: "New Task", description: "Desc", assignedTo: "User" };

        // Fake response from server (created task with ID + timestamps)
        const created: TaskItem = {
            id: "2",
            ...dto,
            status: 0, // default "New"
            createdAt: "2025-09-01T00:00:00Z",
            modified: "2025-09-01T00:00:00Z",
        };

        // Mock POST /api/tasks → respond with created task
        mock.onPost("http://localhost:5023/api/tasks").reply(200, created);

        // Call the actual client function
        const result = await createTask(dto);

        // Assert ID and title match the created task
        expect(result.id).toBe("2");
        expect(result.title).toBe("New Task");
    });
});
