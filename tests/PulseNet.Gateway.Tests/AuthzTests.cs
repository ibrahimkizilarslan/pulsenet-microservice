using System.Net;
using System.Net.Http.Headers;

namespace PulseNet.Gateway.Tests;

public class AuthzTests : IClassFixture<GatewayTestFixture>
{
    private readonly HttpClient _client;
    private readonly GatewayTestFixture _fixture;

    public AuthzTests(GatewayTestFixture fixture)
    {
        _fixture = fixture;
        _fixture.MockHandler.SetHandler((_, _) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)));
        _client = fixture.CreateClient();
    }

    [Fact]
    public async Task Auth_NoToken_Returns401ForProtectedRoute()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/posts");

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Auth_ValidToken_Returns200ForProtectedRoute()
    {
        var token = TestTokenHelper.GenerateToken();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/posts");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Auth_InvalidToken_Returns401()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/posts");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "this.is.not.a.valid.token");

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Auth_AuthRoute_DoesNotRequireToken()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/auth/register");

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Auth_ExpiredToken_Returns401()
    {
        var expiredToken = TestTokenHelper.GenerateExpiredToken();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/users");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", expiredToken);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
