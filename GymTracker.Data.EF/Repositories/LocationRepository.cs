using GymTracker.Data.EF.Repositories.Interfaces;
using GymTracker.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GymTracker.Data.EF.Repositories
{
    public class LocationRepository : ILocationRepository
    {
        private readonly GymTrackerContext _context;

        public LocationRepository(GymTrackerContext context)
        {
            _context = context;
        }

        public async Task<bool> AddLocation(string location)
        {
            if (string.IsNullOrWhiteSpace(location))
            {
                throw new ArgumentNullException(nameof(location));
            }
            try
            {
                if (await _context.Locations.AnyAsync(x => x.Name == location))
                {
                    throw new ArgumentException("Location Already Exists");
                }

                await _context.Locations.AddAsync(new Domain.Location() { Name = location });
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }            
        }

        public async Task<List<Location>> GetLocations()
        {
            return await _context.Locations.AsNoTracking().ToListAsync();
        }
    }
}
