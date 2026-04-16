using GymTracker.Data.EF.Repositories.Interfaces;
using GymTracker.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GymTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GymSessionController : ControllerBase
    {
        public IGymSessionRepository GymSessionRepository { get; set; }
        public GymSessionController(IGymSessionRepository gymSessionRepository)
        {
            GymSessionRepository = gymSessionRepository;
        }

        [HttpPost]
        public async Task<IActionResult> AddGymSession([FromBody] GymSession gymSession)
        {
            var sessionId = await GymSessionRepository.AddGymSession(gymSession);
            return sessionId.HasValue ? Ok(new { id = sessionId.Value }) : BadRequest();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteGymSession([FromBody] Guid id)
        {
            var result = await GymSessionRepository.RemoveGymSession(id);
            return result ? Ok() : BadRequest();
        }

        [HttpGet]
        public async Task<IActionResult> GetSessions()
        {
            return Ok(await GymSessionRepository.GetSessions());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSessions([FromRoute] Guid id)
        {
            return Ok(await GymSessionRepository.GetSessionAsync(id));
        }

        [HttpGet("exercise-history")]
        public async Task<IActionResult> GetExerciseHistory([FromQuery] string exerciseName, [FromQuery] Guid locationId)
        {
            if (string.IsNullOrWhiteSpace(exerciseName))
                return BadRequest("exerciseName is required.");

            if (locationId == Guid.Empty)
                return BadRequest("locationId is required.");

            var sessions = await GymSessionRepository.GetExerciseHistory(exerciseName, locationId);

            var result = sessions.Select(s => new
            {
                date = s.DateStarted,
                sets = s.Exercises
                    .Where(e => e.ExerciseName.Name.ToLower() == exerciseName.ToLower().Trim())
                    .SelectMany(e => e.LiftSets)
                    .Select(ls => new { reps = ls.Reps, weight = ls.Weight })
                    .ToList()
            });

            return Ok(result);
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteSession([FromRoute] Guid id)
        {
            var session = await GymSessionRepository.GetSessionAsync(id);
            if (session == null)
                return NotFound();

            // We need to get the tracked entity since GetSessionAsync uses AsNoTracking
            var tracked = await GymSessionRepository.GetSessionTrackedAsync(id);
            if (tracked == null)
                return NotFound();

            tracked.DateEnded = DateTime.UtcNow;
            await GymSessionRepository.SaveAsync();
            return Ok(new { dateEnded = tracked.DateEnded });
        }

        [HttpGet("exercise-progress")]
        public async Task<IActionResult> GetExerciseProgress([FromQuery] string exerciseName)
        {
            if (string.IsNullOrWhiteSpace(exerciseName))
                return BadRequest("exerciseName is required.");

            var sessions = await GymSessionRepository.GetExerciseProgress(exerciseName);

            var result = sessions.Select(s => new
            {
                date = s.DateStarted,
                maxWeight = s.Exercises
                    .Where(e => e.ExerciseName.Name.ToLower() == exerciseName.ToLower().Trim())
                    .SelectMany(e => e.LiftSets)
                    .Select(ls => ls.Weight)
                    .DefaultIfEmpty(0)
                    .Max(),
                totalVolume = s.Exercises
                    .Where(e => e.ExerciseName.Name.ToLower() == exerciseName.ToLower().Trim())
                    .SelectMany(e => e.LiftSets)
                    .Sum(ls => ls.Weight * ls.Reps),
                bestSet = s.Exercises
                    .Where(e => e.ExerciseName.Name.ToLower() == exerciseName.ToLower().Trim())
                    .SelectMany(e => e.LiftSets)
                    .OrderByDescending(ls => ls.Weight)
                    .ThenByDescending(ls => ls.Reps)
                    .Select(ls => new { reps = ls.Reps, weight = ls.Weight })
                    .FirstOrDefault()
            }).OrderBy(x => x.date);

            return Ok(result);
        }
    }
}
