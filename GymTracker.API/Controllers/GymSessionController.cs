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
            var result = await GymSessionRepository.AddGymSession(gymSession);
            return result ? Ok() : BadRequest();
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
    }
}
