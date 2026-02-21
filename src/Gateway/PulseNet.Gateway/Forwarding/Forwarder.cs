using System.Net;
using System.Text.Json;
using PulseNet.Gateway.Routing;

namespace PulseNet.Gateway.Forwarding;

public sealed class Forwarder
{
    private const string InternalHeader = "X-Internal-Gateway";
    private const string InternalHeaderValue = "PulseNetSecret";
    private const string CorrelationIdHeader = "X-Correlation-Id";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly RouteMatcher _routeMatcher;
    private readonly ILogger<Forwarder> _logger;

    private static readonly HashSet<string> RestrictedHeaders = new(StringComparer.OrdinalIgnoreCase)
    {
        "Host", "Connection", "Transfer-Encoding", "Keep-Alive",
        "Upgrade", "Proxy-Authorization", "TE", "Trailer"
    };

    public Forwarder(IHttpClientFactory httpClientFactory, RouteMatcher routeMatcher, ILogger<Forwarder> logger)
    {
        _httpClientFactory = httpClientFactory;
        _routeMatcher = routeMatcher;
        _logger = logger;
    }

    public async Task ForwardAsync(HttpContext context, RouteConfig route)
    {
        var correlationId = context.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString("N");
        var downstreamUrl = _routeMatcher.BuildDownstreamUrl(route, context.Request.Path, context.Request.QueryString.Value);

        _logger.LogInformation("Forwarding {Method} {Path} → {Downstream} [CorrelationId: {CorrelationId}]",
            context.Request.Method, context.Request.Path, downstreamUrl, correlationId);

        var requestMessage = new HttpRequestMessage
        {
            Method = new HttpMethod(context.Request.Method),
            RequestUri = new Uri(downstreamUrl)
        };

        foreach (var header in context.Request.Headers)
        {
            if (RestrictedHeaders.Contains(header.Key))
                continue;
            requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
        }

        requestMessage.Headers.TryAddWithoutValidation(InternalHeader, InternalHeaderValue);
        requestMessage.Headers.TryAddWithoutValidation(CorrelationIdHeader, correlationId);

        if (context.Request.ContentLength > 0 || context.Request.Body.CanRead && context.Request.Method != HttpMethod.Get.Method)
        {
            var bodyStream = new MemoryStream();
            await context.Request.Body.CopyToAsync(bodyStream);
            bodyStream.Position = 0;

            if (bodyStream.Length > 0)
            {
                requestMessage.Content = new StreamContent(bodyStream);
                if (context.Request.ContentType is not null)
                    requestMessage.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(context.Request.ContentType);
            }
        }

        try
        {
            var client = _httpClientFactory.CreateClient("gateway");
            var response = await client.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead, context.RequestAborted);

            context.Response.StatusCode = (int)response.StatusCode;

            foreach (var header in response.Headers)
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }

            foreach (var header in response.Content.Headers)
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }

            context.Response.Headers.Remove("transfer-encoding");

            await response.Content.CopyToAsync(context.Response.Body);
        }
        catch (TaskCanceledException)
        {
            _logger.LogWarning("Request to {Downstream} timed out [CorrelationId: {CorrelationId}]", downstreamUrl, correlationId);
            context.Response.StatusCode = StatusCodes.Status504GatewayTimeout;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "Gateway Timeout" }));
        }
        catch (HttpRequestException ex) when (ex.StatusCode is null)
        {
            _logger.LogError(ex, "Downstream service unreachable: {Downstream} [CorrelationId: {CorrelationId}]", downstreamUrl, correlationId);
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "Service Unavailable" }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error forwarding to {Downstream} [CorrelationId: {CorrelationId}]", downstreamUrl, correlationId);
            context.Response.StatusCode = StatusCodes.Status502BadGateway;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "Bad Gateway" }));
        }
    }
}
