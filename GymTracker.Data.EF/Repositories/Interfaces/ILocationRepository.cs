using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF.Repositories.Interfaces
{
    public interface ILocationRepository
    {
        Task<List<string>> GetLocations();

        Task<bool> AddLocation(string location);
    }
}
