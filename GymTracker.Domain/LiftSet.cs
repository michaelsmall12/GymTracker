using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Domain
{
    public class LiftSet
    {
        public Guid Id { get; set; }

        public int Reps { get; set; }

        public float Weight { get; set; }
    }
}
