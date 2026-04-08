using Microsoft.EntityFrameworkCore;
using GymTracker.Domain;
using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Data.EF
{
    public class GymTrackerContext : DbContext
    {
        public DbSet<GymSession> Sessions { get; set; }

        public DbSet<Exercise> Exercises { get; set; }

        public DbSet<LiftSet> LiftSets { get; set; }

        public DbSet<ExerciseImage> Images{get;set;}

        public DbSet<Location> Locations { get; set; }

        public string DbPath { get; }

        public GymTrackerContext()
        {
            var folder = Environment.SpecialFolder.LocalApplicationData;
            var path = Environment.GetFolderPath(folder);
            DbPath = System.IO.Path.Join(path, "blogging.db");
        }

        // The following configures EF to create a Sqlite database file in the
        // special "local" folder for your platform.
        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite($"Data Source={DbPath}");
    }
}
