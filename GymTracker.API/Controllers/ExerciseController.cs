using GymTracker.Data.EF.Repositories.Interfaces;
using GymTracker.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GymTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExerciseController : ControllerBase
    {
        public IExerciseRepository ExerciseRepository { get; set; }
        public ExerciseController(IExerciseRepository exerciseRepository)
        {
            ExerciseRepository = exerciseRepository;
        }

        [HttpPost]
        public async Task<IActionResult> AddExercise([FromBody] Exercise exercise)
        {
            var result = await ExerciseRepository.AddExercise(exercise);
            return result ? Ok() : BadRequest();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteExercise([FromQuery] Guid id)
        {
            var result = await ExerciseRepository.RemoveExercise(id);
            return result ? Ok() : BadRequest();
        }
    }
}
