namespace RecommenderApp.Services;

public class RecommendationService
{
    private readonly Dictionary<string, List<string>> _collabRecs;
    private readonly Dictionary<string, List<string>> _contentRecs;

    public RecommendationService()
    {
        _collabRecs = LoadRecommendations("collaborative_recommendations.csv");
        _contentRecs = LoadRecommendations("content_recommendations.csv");
    }

    private Dictionary<string, List<string>> LoadRecommendations(string filePath)
    {
        return File.ReadAllLines(filePath)
            .Skip(1)
            .Select(line => line.Split(','))
            .GroupBy(parts => parts[0])
            .ToDictionary(
                g => g.Key,
                g => g.Select(parts => parts[1]).Distinct().Take(5).ToList()
            );
    }

    public List<string> GetCollaborativeRecs(string userId)
    {
        return _collabRecs.ContainsKey(userId) ? _collabRecs[userId] : new List<string>();
    }

    public List<string> GetContentRecs(string userId)
    {
        return _contentRecs.ContainsKey(userId) ? _contentRecs[userId] : new List<string>();
    }
}