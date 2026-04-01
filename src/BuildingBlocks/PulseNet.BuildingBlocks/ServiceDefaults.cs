using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PulseNet.BuildingBlocks.Middleware;
using Serilog;
using Prometheus;

namespace PulseNet.BuildingBlocks;

public static class ServiceDefaults
{
    public static WebApplicationBuilder AddServiceDefaults(this WebApplicationBuilder builder)
    {
        builder.Host.UseSerilog((context, configuration) =>
        {
            configuration
                .ReadFrom.Configuration(context.Configuration)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Application", builder.Environment.ApplicationName)
                .WriteTo.Console(outputTemplate:
                    "[{Timestamp:HH:mm:ss} {Level:u3}] [{Application}] {Message:lj} {Properties:j}{NewLine}{Exception}");
        });

        return builder;
    }

    public static WebApplication UseServiceDefaults(this WebApplication app, bool isGateway = false)
    {
        app.UseMiddleware<CorrelationIdMiddleware>();
        
        // Dispatcher (Gateway) does not need to verify its own header.
        // It's the one responsible for adding it to downstream requests.
        if (!isGateway)
        {
            app.UseMiddleware<InternalGatewayHeaderMiddleware>();
        }

        app.UseSerilogRequestLogging();
        
        // Prometheus metrics
        app.UseHttpMetrics();
        app.MapMetrics();

        return app;
    }
}
