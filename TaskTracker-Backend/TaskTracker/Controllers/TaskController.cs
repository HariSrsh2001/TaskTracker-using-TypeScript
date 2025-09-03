using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using TaskTracker.Domain.Models;
using TaskTracker.Services.Interfaces;
using DomainTaskStatus = TaskTracker.Domain.Models.TaskStatus;
using TaskTracker.Api.Hubs;

namespace TaskTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly IHubContext<TasksHub> _hubContext;

        public TasksController(ITaskService taskService, IHubContext<TasksHub> hubContext)
        {
            _taskService = taskService;
            _hubContext = hubContext;
        }

        // Helper to always store time in Indian Standard Time (IST)
        private DateTime GetIndianTime()
        {
            var indiaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, indiaTimeZone);
        }

        // ✅ GET: /api/tasks
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var tasks = await _taskService.GetAllTasksAsync();
            return Ok(tasks);
        }

        // ✅ POST: /api/tasks
        [HttpPost]
        public async Task<IActionResult> Post(TaskItem task)
        {
            task.CreatedAt = GetIndianTime();   // 🔹 fixed: use CreatedAt
            task.Modified = GetIndianTime();

            var created = await _taskService.CreateTaskAsync(task);

            // Notify all connected clients via SignalR
            await _hubContext.Clients.All.SendAsync("TaskCreated", created);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // ✅ GET: /api/tasks/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            if (task == null) return NotFound();
            return Ok(task);
        }

        // ✅ PUT: /api/tasks/{id} (full update)
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(Guid id, TaskItem updatedTask)
        {
            var existingTask = await _taskService.GetTaskByIdAsync(id);
            if (existingTask == null) return NotFound();

            existingTask.Title = updatedTask.Title ?? existingTask.Title;
            existingTask.Description = updatedTask.Description ?? existingTask.Description;
            existingTask.AssignedTo = updatedTask.AssignedTo ?? existingTask.AssignedTo;
            existingTask.Status = updatedTask.Status;

            // 🔹 Only update Modified, keep CreatedAt intact
            existingTask.Modified = GetIndianTime();

            var updated = await _taskService.UpdateTaskAsync(id, existingTask);

            await _hubContext.Clients.All.SendAsync("TaskUpdated", updated);

            return Ok(updated);
        }

        // ✅ PATCH: /api/tasks/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] DomainTaskStatus status)
        {
            var existingTask = await _taskService.GetTaskByIdAsync(id);
            if (existingTask == null) return NotFound();

            existingTask.Status = status;
            existingTask.Modified = GetIndianTime();

            var updated = await _taskService.UpdateTaskAsync(id, existingTask);

            await _hubContext.Clients.All.SendAsync("TaskUpdated", updated);

            return Ok(updated);
        }

        // ✅ DELETE: /api/tasks/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var deleted = await _taskService.DeleteTaskAsync(id);
            if (!deleted) return NotFound();

            await _hubContext.Clients.All.SendAsync("TaskDeleted", id);

            return NoContent();
        }
    }
}
