export enum TaskStatus {
    New = 0,
    InProgress = 1,
    Completed = 2,
}

export interface TaskItem {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    status: TaskStatus;
    createdAt: string;
    modified: string;
}

export interface CreateTaskDTO {
    title: string;
    description: string;
    assignedTo: string;
}
