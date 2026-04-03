using GymTracker.Domain;
using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF.Repositories.Interfaces
{
    public interface IExerciseRepository
    {
        Task<bool> AddExercise(Exercise exercise);

        Task<bool> RemoveExercise(Guid exercise);
    }
}
