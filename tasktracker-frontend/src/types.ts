// Enum representing task status values
export enum TaskStatus {
    New = 0,          // Task has just been created
    InProgress = 1,   // Task is currently being worked on
    Completed = 2     // Task is finished
}

// Full task object returned from API / used in app
export interface TaskItem {
    id: string;           // unique identifier
    title: string;        // task title
    description: string;  // task details
    assignedTo: string;   // user the task is assigned to
    status: TaskStatus;   // current status (enum above)
    createdAt: Date;      // when the task was created
    modified: Date;       // when the task was last updated
}

// DTO (Data Transfer Object) for creating a new task
// Note: id, status, timestamps are set by the server
export interface CreateTaskDTO {
    title: string;
    description: string;
    assignedTo: string;
}
