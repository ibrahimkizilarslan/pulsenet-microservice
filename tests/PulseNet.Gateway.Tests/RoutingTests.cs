using System.Net;
using System.Net.Http.Headers;

namespace PulseNet.Gateway.Tests;

public class RoutingTests : IClassFixture<GatewayTestFixture>
{
    private readonly HttpClient _client;
    private readonly GatewayTestFixture _fixture;

    public RoutingTests(GatewayTestFixture fixture)
    {
        _fixture = fixture;
        _fixture.MockHandler.SetHandler((request, _) =>
        {
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent($"{{\"forwarded_to\":\"{request.RequestUri}\"}}")
            };
            return Task.FromResult(response);
        });
        _client = fixture.CreateClient();
    }

    [Theory]
    [InlineData("/api/posts", "http://posts:5003/api/posts")]
    [InlineData("/api/users", "http://users:5002/api/users")]
    [InlineData("/api/follows", "http://follows:5004/api/follows")]
    [InlineData("/api/timeline", "http://timeline:5005/api/timeline")]
    public async Task Routing_ForwardsToCorrectDownstreamService(string path, string expectedDownstream)
    {
        var token = TestTokenHelper.GenerateToken();
        var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains(expectedDownstream, body);
    }

    [Fact]
    public async Task Routing_AuthPath_DoesNotRequireToken()
    {
        var response = await _client.GetAsync("/api/auth/login");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Routing_UnknownPath_Returns404()
    {
        var token = TestTokenHelper.GenerateToken();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/unknown-service/test");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Routing_PostsSubpath_ForwardsCorrectly()
    {
        var token = TestTokenHelper.GenerateToken();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/posts/123/comments");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("http://posts:5003/api/posts/123/comments", body);
    }

    [Fact]
    public async Task Routing_HealthEndpoint_ReturnsOk()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("healthy", body);
    }
}
