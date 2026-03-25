using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using Moq;

namespace PulseNet.Gateway.Tests;

public class DelegatingMockHandler : DelegatingHandler
{
    private volatile Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> _handler;

    public DelegatingMockHandler()
    {
        _handler = DefaultHandler;
    }

    public void SetHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handler)
    {
        _handler = handler;
    }

    public void Reset()
    {
        _handler = DefaultHandler;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        return _handler(request, cancellationToken);
    }

    private static Task<HttpResponseMessage> DefaultHandler(HttpRequestMessage request, CancellationToken ct)
    {
        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent($"{{\"forwarded_to\":\"{request.RequestUri}\"}}", Encoding.UTF8, "application/json")
        });
    }
}

public class GatewayTestFixture : WebApplicationFactory<Program>
{
    public DelegatingMockHandler MockHandler { get; } = new();

    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.AddHttpClient("gateway")
                .ConfigurePrimaryHttpMessageHandler(() => MockHandler);

            // Mock MongoDB
            var mockDatabase = new Moq.Mock<MongoDB.Driver.IMongoDatabase>();
            var mockCollection = new Moq.Mock<MongoDB.Driver.IMongoCollection<PulseNet.Gateway.Routing.RouteConfig>>();
            
            var defaultRoutes = new List<PulseNet.Gateway.Routing.RouteConfig>
            {
                new() { PathPrefix = "/api/auth", DownstreamHost = "http://auth:5001", RequiresAuth = false },
                new() { PathPrefix = "/api/users", DownstreamHost = "http://users:5002", RequiresAuth = true },
                new() { PathPrefix = "/api/posts", DownstreamHost = "http://posts:5003", RequiresAuth = true },
                new() { PathPrefix = "/api/follows", DownstreamHost = "http://follows:5004", RequiresAuth = true },
                new() { PathPrefix = "/api/timeline", DownstreamHost = "http://timeline:5005", RequiresAuth = true }
            };

            var cursorMock = new Moq.Mock<MongoDB.Driver.IAsyncCursor<PulseNet.Gateway.Routing.RouteConfig>>();
            cursorMock.Setup(c => c.Current).Returns(defaultRoutes);
            cursorMock.SetupSequence(c => c.MoveNext(Moq.It.IsAny<CancellationToken>())).Returns(true).Returns(false);
            cursorMock.SetupSequence(c => c.MoveNextAsync(Moq.It.IsAny<CancellationToken>())).ReturnsAsync(true).ReturnsAsync(false);

            mockCollection.Setup(c => c.FindAsync(
                Moq.It.IsAny<MongoDB.Driver.FilterDefinition<PulseNet.Gateway.Routing.RouteConfig>>(),
                Moq.It.IsAny<MongoDB.Driver.FindOptions<PulseNet.Gateway.Routing.RouteConfig, PulseNet.Gateway.Routing.RouteConfig>>(),
                Moq.It.IsAny<CancellationToken>()))
                .ReturnsAsync(cursorMock.Object);

            mockCollection.Setup(c => c.EstimatedDocumentCountAsync(
                Moq.It.IsAny<MongoDB.Driver.EstimatedDocumentCountOptions>(),
                Moq.It.IsAny<CancellationToken>()))
                .ReturnsAsync(5); // Not empty

            mockDatabase.Setup(d => d.GetCollection<PulseNet.Gateway.Routing.RouteConfig>("routes", null))
                .Returns(mockCollection.Object);

            services.AddSingleton(mockDatabase.Object);
        });
    }
}
