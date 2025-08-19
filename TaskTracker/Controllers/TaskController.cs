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

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var tasks = await _taskService.GetAllTasksAsync();
            return Ok(tasks);
        }

        [HttpPost]
        public async Task<IActionResult> Post(TaskItem task)
        {
            var created = await _taskService.CreateTaskAsync(task);

            // Notify clients a new task was created
            await _hubContext.Clients.All.SendAsync("TaskCreated", created);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            if (task == null) return NotFound();
            return Ok(task);
        }

        // FULL update (merge updated fields)
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(Guid id, TaskItem updatedTask)
        {
            var existingTask = await _taskService.GetTaskByIdAsync(id);
            if (existingTask == null) return NotFound();

            existingTask.Title = updatedTask.Title ?? existingTask.Title;
            existingTask.Description = updatedTask.Description ?? existingTask.Description;
            existingTask.AssignedTo = updatedTask.AssignedTo ?? existingTask.AssignedTo;
            existingTask.Status = updatedTask.Status;
            existingTask.Modified = DateTime.UtcNow;

            var updated = await _taskService.UpdateTaskAsync(id, existingTask);

            // Notify clients task was updated
            await _hubContext.Clients.All.SendAsync("TaskUpdated", updated);

            return Ok(updated);
        }

        // PATCH only status update
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] DomainTaskStatus status)
        {
            var existingTask = await _taskService.GetTaskByIdAsync(id);
            if (existingTask == null) return NotFound();

            existingTask.Status = status;
            existingTask.Modified = DateTime.UtcNow;

            var updated = await _taskService.UpdateTaskAsync(id, existingTask);

            // Notify clients task was updated
            await _hubContext.Clients.All.SendAsync("TaskUpdated", updated);

            return Ok(updated);
        }



        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteTask(Guid id)
        //{
        //    var task = await _taskService.GetTaskByIdAsync(id);
        //    if (task == null)
        //        return NotFound();

        //    await _taskService.DeleteTaskAsync(id);

        //    // Notify all connected clients that a task was deleted
        //    await _hubContext.Clients.All.SendAsync("TaskDeleted", id);

        //    return NoContent();
        //}

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var deleted = await _taskService.DeleteTaskAsync(id);
            if (!deleted)
                return NotFound();

            // Notify all connected clients instantly
            await _hubContext.Clients.All.SendAsync("TaskDeleted", id);

            return NoContent();
        }





    }
}
