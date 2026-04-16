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

        public async Task<ExerciseName?> AddExerciseName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Name is invalid");
            }

            var existing = await _context.ExerciseNames
                .FirstOrDefaultAsync(e => e.Name.ToLower() == name.ToLower().Trim());

            if (existing != null)
            {
                return null;
            }

            var exerciseName = new ExerciseName() { Name = name.Trim() };
            _context.ExerciseNames.Add(exerciseName);
            await _context.SaveChangesAsync();
            return exerciseName;
        }

        public async Task<List<ExerciseName>> GetExerciseNames()
        {
            return await _context.ExerciseNames.AsNoTracking().ToListAsync();
        }


    }
}
