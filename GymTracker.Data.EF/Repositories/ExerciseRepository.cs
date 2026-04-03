using GymTracker.Data.EF.Repositories.Interfaces;
using GymTracker.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF.Repositories
{
    public class ExerciseRepository : IExerciseRepository
    {
        private readonly GymTrackerContext _context;

        public ExerciseRepository(GymTrackerContext context)
        {
            _context = context;
        }

        public async Task<bool> AddExercise(Exercise exercise)
        {
            if (exercise == null)
            {
                throw new ArgumentNullException(nameof(exercise));
            }

            try
            {
                await _context.Exercises.AddAsync(exercise);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> RemoveExercise(Guid exercise)
        {
            var exerciseToDelete = await _context.Exercises.FirstOrDefaultAsync(x => x.Id == exercise);

            if (exerciseToDelete == null)
            {
                throw new ArgumentException("Exercise not found");
            }

            try
            {
                _context.Exercises.Remove(exerciseToDelete);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
