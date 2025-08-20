﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTracker.Domain.Models;
using TaskTracker.Services.Interfaces;
using TaskTracker.Domain.Interfaces;


namespace TaskTracker.Services.Implementations
{
    public class TaskService : ITaskService
    {
        private readonly IRepository<TaskItem> _taskRepository;

        public TaskService(IRepository<TaskItem> taskRepository)
        {
            _taskRepository = taskRepository;
        }

        public async Task<IEnumerable<TaskItem>> GetAllTasksAsync()
        {
            return await _taskRepository.GetAllAsync();
        }

        public async Task<TaskItem?> GetTaskByIdAsync(Guid id)
        {
            return await _taskRepository.GetByIdAsync(id);
        }

        public async Task<TaskItem> CreateTaskAsync(TaskItem task)
        {
            task.Id = Guid.NewGuid();
            task.CreatedAt = DateTime.Now;
            task.Modified = DateTime.Now;
            await _taskRepository.AddAsync(task);
            return task;
        }

        public async Task<TaskItem?> UpdateTaskAsync(Guid id, TaskItem task)
        {
            var existing = await _taskRepository.GetByIdAsync(id);
            if (existing == null) return null;

            existing.Title = task.Title;
            existing.Description = task.Description;
            existing.AssignedTo = task.AssignedTo;
            existing.Status = task.Status;
            existing.Modified = DateTime.Now;

            await _taskRepository.UpdateAsync(existing);
            return existing;
        }

        public async Task<bool> DeleteTaskAsync(Guid id)
        {
            var existing = await _taskRepository.GetByIdAsync(id);
            if (existing == null) return false;

            await _taskRepository.DeleteAsync(id);
            return true;
        }
    }
}
