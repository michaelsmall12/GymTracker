using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Domain
{
    public class Exercise
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public List<LiftSet> LiftSets { get; set; } = new List<LiftSet>();

        public ExerciseImage Image { get; set; }
    }
}
