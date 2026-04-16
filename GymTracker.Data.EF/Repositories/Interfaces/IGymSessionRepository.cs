using GymTracker.Domain;
using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF.Repositories.Interfaces
{
    public interface IGymSessionRepository
    {
        Task<Guid?> AddGymSession(GymSession gymSession);

        Task<bool> RemoveGymSession(Guid gymSession);

        Task<List<GymSession>> GetSessions();
        Task<GymSession> GetSessionAsync(Guid id);

        Task<GymSession> GetSessionTrackedAsync(Guid id);

        Task SaveAsync();

        Task<List<GymSession>> GetExerciseHistory(string exerciseName, Guid locationId, int count = 3);

        Task<List<GymSession>> GetExerciseProgress(string exerciseName, int count = 20);
    }
}
