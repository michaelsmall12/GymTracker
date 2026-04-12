using GymTracker.Data.EF.Repositories.Interfaces;
using GymTracker.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF.Repositories
{
    public class ExerciseNameRepository : IExerciseNameRepository    {
        private readonly GymTrackerContext _context;
        public ExerciseNameRepository(GymTrackerContext context) 
        {
            _context = context;
        }

        public async Task<bool> AddExerciseName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Name in invalid");
            }

            _context.ExerciseNames.Add(new ExerciseName() { Name = name });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ExerciseName>> GetExerciseNames()
        {
            return await _context.ExerciseNames.AsNoTracking().ToListAsync();
        }


    }
}
