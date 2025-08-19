﻿using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTracker.DAL.Data;
using TaskTracker.Domain.Interfaces;
using TaskTracker.Domain.Models;

namespace TaskTracker.DAL.Respositories
{
    public class TaskRepository : IRepository<TaskItem>
    {
        private readonly AppDbContext _context;

        public TaskRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaskItem>> GetAllAsync()
        {
            return await _context.Tasks.AsNoTracking().ToListAsync();
        }

        public async Task<TaskItem?> GetByIdAsync(Guid id)
        {
            return await _context.Tasks.FindAsync(id);
        }

        public async Task AddAsync(TaskItem entity)
        {
            await _context.Tasks.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(TaskItem entity)
        {
            _context.Tasks.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await _context.Tasks.FindAsync(id);
            if (entity != null)
            {
                _context.Tasks.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
