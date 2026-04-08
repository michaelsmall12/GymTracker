using GymTracker.Data.EF.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GymTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        public ILocationRepository LocationRepository { get; set; }
        public LocationController(ILocationRepository locationRepository) 
        { 
        LocationRepository = locationRepository;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await LocationRepository.GetLocations());
        }

        [HttpPost]
        public async Task<IActionResult> AddLocation([FromBody]string name)
        {
            var res = await LocationRepository.AddLocation(name);
            if (res)
            {
                return Created();
            }
            return BadRequest();
            
        }
    }
}
