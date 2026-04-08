using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Domain
{
    public class GymSession
    {
        public Guid Id { get; set;  }

        public List<Exercise> Exercises { get; set; }

        public Location Location { get; set; }
    }
}
