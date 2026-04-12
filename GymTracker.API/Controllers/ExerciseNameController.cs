using GymTracker.Data.EF.Repositories.Interfaces;
using GymTracker.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace GymTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExerciseNameController : ControllerBase
    {
        private IExerciseNameRepository nameRepository;
        public ExerciseNameController(IExerciseNameRepository exerciseNameRepository) 
        {
            nameRepository = exerciseNameRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetNames()
        {
            return Ok(await nameRepository.GetExerciseNames());
        }

        [HttpPost]
        public async Task<IActionResult> AddName([FromBody]string name)
        {
            return await nameRepository.AddExerciseName(name) ? Ok() : BadRequest();
        }
    }
}
