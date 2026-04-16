using GymTracker.Domain;
using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF.Repositories.Interfaces
{
    public interface IExerciseNameRepository
    {
        Task<List<ExerciseName>> GetExerciseNames();

        Task<ExerciseName?> AddExerciseName(string name);
    }
}
