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

        public async Task<bool> AddGymSession(GymSession gymSession)
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
                        // use the tracked entity so EF doesn't try to insert a duplicate
                        gymSession.Location = existingLocation;
                    }
                    else
                    {
                        // new location: add it explicitly (optional)
                        _context.Locations.Add(gymSession.Location);
                    }
                }
                await _context.Sessions.AddAsync(gymSession);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<List<GymSession>> GetSessions()
        {
            return await _context.Sessions.ToListAsync();
        }

        public async Task<bool> RemoveGymSession(Guid gymSession)
        {
            var SessionToDelete = await _context.Sessions.FirstOrDefaultAsync(x => x.Id == gymSession);

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
    }
}
