using System.Text;
using System.Text.Json;
using PulseNet.Posts.Api.Domain;

namespace PulseNet.Posts.Api.Services;

public sealed class TimelineFanOutService
{
    private static readonly JsonSerializerOptions ReadOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly JsonSerializerOptions WriteOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TimelineFanOutService> _logger;

    public TimelineFanOutService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<TimelineFanOutService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task TryFanOutAsync(Post post, CancellationToken cancellationToken = default)
    {
        var secret = _configuration["InternalGateway:Secret"] ?? "PulseNetSecret";
        var followsBase = (_configuration["Downstream:FollowsBaseUrl"] ?? "http://localhost:5004").TrimEnd('/');
        var timelineBase = (_configuration["Downstream:TimelineBaseUrl"] ?? "http://localhost:5005").TrimEnd('/');

        try
        {
            var client = _httpClientFactory.CreateClient(nameof(TimelineFanOutService));
            using var followersRequest = new HttpRequestMessage(
                HttpMethod.Get,
                $"{followsBase}/api/follows/followers/{Uri.EscapeDataString(post.AuthorId)}");
            followersRequest.Headers.TryAddWithoutValidation("X-Internal-Gateway", secret);

            var followersResponse = await client.SendAsync(followersRequest, cancellationToken);
            if (!followersResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Fan-out: failed to load followers for author {AuthorId}: {Status}",
                    post.AuthorId,
                    followersResponse.StatusCode);
                return;
            }

            await using var stream = await followersResponse.Content.ReadAsStreamAsync(cancellationToken);
            var follows = await JsonSerializer.DeserializeAsync<List<FollowPayload>>(
                stream,
                ReadOptions,
                cancellationToken) ?? [];

            var recipientIds = new HashSet<string>(StringComparer.Ordinal) { post.AuthorId };
            foreach (var f in follows)
                recipientIds.Add(f.FollowerId);

            var batch = recipientIds.Select(uid => new TimelineBatchItem(
                UserId: uid,
                PostId: post.Id,
                AuthorId: post.AuthorId,
                Content: post.Content,
                PostCreatedAt: post.CreatedAt)).ToList();

            var body = JsonSerializer.Serialize(batch, WriteOptions);
            using var batchRequest = new HttpRequestMessage(
                HttpMethod.Post,
                $"{timelineBase}/api/timeline/batch")
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json")
            };
            batchRequest.Headers.TryAddWithoutValidation("X-Internal-Gateway", secret);

            var batchResponse = await client.SendAsync(batchRequest, cancellationToken);
            if (!batchResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Fan-out: timeline batch failed for post {PostId}: {Status}",
                    post.Id,
                    batchResponse.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Fan-out failed for post {PostId}", post.Id);
        }
    }

    private sealed record FollowPayload(string FollowerId, string FolloweeId);

    private sealed record TimelineBatchItem(
        string UserId,
        string PostId,
        string AuthorId,
        string Content,
        DateTime PostCreatedAt);
}
