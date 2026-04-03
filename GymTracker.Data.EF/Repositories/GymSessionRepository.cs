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
                await _context.Sessions.AddAsync(gymSession);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
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
