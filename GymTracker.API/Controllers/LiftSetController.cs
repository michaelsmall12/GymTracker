using GymTracker.Data.EF.Repositories.Interfaces;
using GymTracker.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.VisualBasic;

namespace GymTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LiftSetController : ControllerBase
    {
        public ILiftSetRepository LiftSetRepository { get; set; }
        public LiftSetController(ILiftSetRepository liftSetRepository)
        {
            LiftSetRepository = liftSetRepository;
        }

        [HttpPost]
        public async Task<IActionResult> AddLiftSet([FromBody]LiftSet liftSet)
        {
            var result = await LiftSetRepository.AddLiftSet(liftSet);
            return result ? Ok() : BadRequest();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteLiftSet([FromQuery]Guid id)
        {
            var result = await LiftSetRepository.RemoveLiftSet(id);
            return result ? Ok() : BadRequest();
        }
    }
}
