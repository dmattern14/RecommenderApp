using RecommenderApp.Services;

namespace RecommenderApp.Controllers;

using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class RecommendationController : ControllerBase
{
    private readonly RecommendationService _service;

    public RecommendationController()
    {
        _service = new RecommendationService();
    }

    [HttpGet("{userId}")]
    public IActionResult GetRecommendations(string userId)
    {
        var collab = _service.GetCollaborativeRecs(userId);
        var content = _service.GetContentRecs(userId);

        return Ok(new
        {
            Collaborative = collab,
            ContentBased = content
        });
    }
}
