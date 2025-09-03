using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTracker.Domain.Models;


namespace TaskTracker.Services.Interfaces
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskItem>> GetAllTasksAsync();
        Task<TaskItem?> GetTaskByIdAsync(Guid id);
        Task<TaskItem> CreateTaskAsync(TaskItem task);
        Task<TaskItem?> UpdateTaskAsync(Guid id, TaskItem task);
        Task<bool> DeleteTaskAsync(Guid id);
    }
}
