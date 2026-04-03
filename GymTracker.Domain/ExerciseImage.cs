using System;
using System.Collections.Generic;
using System.Text;

namespace GymTracker.Domain
{
    public class ExerciseImage
    {
        public Guid Id { get; set; }

        public string Url { get; set; }

        public string FileName { get; set; }

        public string ContentType { get; set; }

        public long SizeBytes { get; set; }

        public DateTimeOffset UploadedAt { get; set; }
    }
}
