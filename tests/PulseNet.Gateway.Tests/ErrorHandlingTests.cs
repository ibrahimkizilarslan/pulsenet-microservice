using System.Net;
using System.Net.Http.Headers;

namespace PulseNet.Gateway.Tests;

public class ErrorHandlingTests : IClassFixture<GatewayTestFixture>
{
    private readonly GatewayTestFixture _fixture;
    private readonly HttpClient _client;

    public ErrorHandlingTests(GatewayTestFixture fixture)
    {
        _fixture = fixture;
        _client = fixture.CreateClient();
    }

    [Fact]
    public async Task ErrorHandling_DownstreamUnavailable_Returns503()
    {
        _fixture.MockHandler.SetHandler((_, _) =>
            throw new HttpRequestException("Connection refused"));

        var token = TestTokenHelper.GenerateToken();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/posts");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Service Unavailable", body);

        _fixture.MockHandler.Reset();
    }

    [Fact]
    public async Task ErrorHandling_DownstreamTimeout_Returns504()
    {
        _fixture.MockHandler.SetHandler((_, _) =>
            throw new TaskCanceledException("Request timed out"));

        var token = TestTokenHelper.GenerateToken();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/users");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.GatewayTimeout, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Gateway Timeout", body);

        _fixture.MockHandler.Reset();
    }

    [Fact]
    public async Task ErrorHandling_DownstreamReturnsError_ForwardsStatusCode()
    {
        _fixture.MockHandler.SetHandler((_, _) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.InternalServerError)
            {
                Content = new StringContent("{\"error\":\"Internal Server Error\"}")
            }));

        var token = TestTokenHelper.GenerateToken();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/posts");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

        _fixture.MockHandler.Reset();
    }

    [Fact]
    public async Task ErrorHandling_InternalGatewayHeaderIsAppended()
    {
        HttpRequestMessage? capturedRequest = null;

        _fixture.MockHandler.SetHandler((req, _) =>
        {
            capturedRequest = req;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        });

        var token = TestTokenHelper.GenerateToken();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/posts");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await _client.SendAsync(request);

        Assert.NotNull(capturedRequest);
        Assert.True(capturedRequest!.Headers.Contains("X-Internal-Gateway"));
        Assert.Equal("PulseNetSecret", capturedRequest.Headers.GetValues("X-Internal-Gateway").First());

        _fixture.MockHandler.Reset();
    }

    [Fact]
    public async Task ErrorHandling_CorrelationIdIsPresent()
    {
        _fixture.MockHandler.SetHandler((_, _) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)));

        var token = TestTokenHelper.GenerateToken();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/posts");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.True(response.Headers.Contains("X-Correlation-Id"));
        var correlationId = response.Headers.GetValues("X-Correlation-Id").First();
        Assert.False(string.IsNullOrWhiteSpace(correlationId));

        _fixture.MockHandler.Reset();
    }
}
