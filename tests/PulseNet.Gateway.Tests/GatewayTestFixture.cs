using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

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
        });
    }
}
