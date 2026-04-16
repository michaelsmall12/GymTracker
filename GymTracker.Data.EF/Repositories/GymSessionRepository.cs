using GymTracker.Data.EF.Repositories.Interfaces;
using GymTracker.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF.Repositories
{
    public class GymSessionRepository : IGymSessionRepository
    {
        private readonly GymTrackerContext _context;

        public GymSessionRepository(GymTrackerContext context)
        {
            _context = context;
        }

        public async Task<Guid?> AddGymSession(GymSession gymSession)
        {
            if (gymSession == null)
            {
                throw new ArgumentNullException(nameof(gymSession));
            }

            try
            {
                if (gymSession.Location != null)
                {
                    var existingLocation = await _context.Locations.FindAsync(gymSession.Location.Id);
                    if (existingLocation != null)
                    {
                        gymSession.Location = existingLocation;
                    }
                    else
                    {
                        _context.Locations.Add(gymSession.Location);
                    }
                }

                // Deduplicate ExerciseNames: look up by name and reuse existing entities
                if (gymSession.Exercises != null)
                {
                    foreach (var exercise in gymSession.Exercises)
                    {
                        if (exercise.ExerciseName != null)
                        {
                            var existingName = await _context.ExerciseNames
                                .FirstOrDefaultAsync(e => e.Name.ToLower() == exercise.ExerciseName.Name.ToLower().Trim());
                            if (existingName != null)
                            {
                                exercise.ExerciseName = existingName;
                            }
                        }
                    }
                }

                gymSession.DateStarted = DateTime.UtcNow;
                gymSession.DateEnded = null;
                await _context.Sessions.AddAsync(gymSession);
                await _context.SaveChangesAsync();
                return gymSession.Id;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<GymSession> GetSessionAsync(Guid id)
        {
            return await _context.Sessions.Include(x => x.Location).Include(x=>x.Exercises).ThenInclude(x=>x.LiftSets).Include(x => x.Exercises).ThenInclude(x => x.ExerciseName).Where(x=>x.Id==id).AsNoTracking().FirstOrDefaultAsync();
        }

        public async Task<GymSession> GetSessionTrackedAsync(Guid id)
        {
            return await _context.Sessions.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<GymSession>> GetSessions()
        {
            return await _context.Sessions.Include(x=>x.Location).AsNoTracking().ToListAsync();
        }

        public async Task<bool> RemoveGymSession(Guid gymSession)
        {
            var SessionToDelete = await _context.Sessions.Include(x=>x.Exercises).Include(x=>x.Location).FirstOrDefaultAsync(x => x.Id == gymSession);

            if (SessionToDelete == null)
            {
                throw new ArgumentException("Session not found");
            }

            try
            {
                _context.Sessions.Remove(SessionToDelete);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<List<GymSession>> GetExerciseHistory(string exerciseName, Guid locationId, int count = 3)
        {
            return await _context.Sessions
                .Include(x => x.Location)
                .Include(x => x.Exercises)
                    .ThenInclude(x => x.LiftSets)
                .Include(x => x.Exercises)
                    .ThenInclude(x => x.ExerciseName)
                .Where(s => s.Location.Id == locationId
                    && s.Exercises.Any(e => e.ExerciseName.Name.ToLower() == exerciseName.ToLower().Trim()))
                .OrderByDescending(s => s.DateStarted)
                .Take(count)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<GymSession>> GetExerciseProgress(string exerciseName, int count = 20)
        {
            return await _context.Sessions
                .Include(x => x.Exercises)
                    .ThenInclude(x => x.LiftSets)
                .Include(x => x.Exercises)
                    .ThenInclude(x => x.ExerciseName)
                .Where(s => s.Exercises.Any(e => e.ExerciseName.Name.ToLower() == exerciseName.ToLower().Trim()))
                .OrderByDescending(s => s.DateStarted)
                .Take(count)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
