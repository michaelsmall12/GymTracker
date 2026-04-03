using GymTracker.Data.EF.Repositories.Interfaces;
using GymTracker.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF.Repositories
{
    public class LiftSetRepository : ILiftSetRepository
    {
        private readonly GymTrackerContext _context;

        public LiftSetRepository(GymTrackerContext context)
        {
            _context = context;
        }

        public async Task<bool> AddLiftSet(LiftSet liftSet)
        {
            if(liftSet == null)
            {
                throw new ArgumentNullException(nameof(liftSet));
            }

            try
            {
                await _context.LiftSets.AddAsync(liftSet);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> RemoveLiftSet(Guid liftSetId)
        {
            var liftSetToDelete = await _context.LiftSets.FirstOrDefaultAsync(x=>x.Id == liftSetId);

            if (liftSetToDelete == null)
            {
                throw new ArgumentException("Lift Set not found");
            }

            try
            {
                _context.LiftSets.Remove(liftSetToDelete);
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
