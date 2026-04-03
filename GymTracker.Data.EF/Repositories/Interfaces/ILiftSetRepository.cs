using GymTracker.Domain;
using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF.Repositories.Interfaces
{
    public interface ILiftSetRepository
    {
        Task<bool> AddLiftSet(LiftSet liftSet);

        Task<bool> RemoveLiftSet(Guid liftSetId);
    }
}
