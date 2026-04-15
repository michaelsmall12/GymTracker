using GymTracker.Domain;
using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF.Repositories.Interfaces
{
    public interface IGymSessionRepository
    {
        Task<bool> AddGymSession(GymSession gymSession);

        Task<bool> RemoveGymSession(Guid gymSession);

        Task<List<GymSession>> GetSessions();
        Task<GymSession> GetSessionAsync(Guid id);
    }
}
