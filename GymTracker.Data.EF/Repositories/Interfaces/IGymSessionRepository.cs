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
    }
}
