using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PulseNet.BuildingBlocks.Middleware;
using Serilog;

namespace PulseNet.BuildingBlocks;

public static class ServiceDefaults
{
    public static WebApplicationBuilder AddServiceDefaults(this WebApplicationBuilder builder)
    {
        // Merkezi loglama için Serilog yapılandırması ayarlanıyor.
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

    public static WebApplication UseServiceDefaults(this WebApplication app)
    {
        // Gelen her isteğe sistem boyunca izlenebilmesi için özel bir 'CorrelationId' atar (Log takibi için).
        app.UseMiddleware<CorrelationIdMiddleware>();
        
        // Mikroservislere doğrudan erişimi engellemek için, isteğin sadece Gateway'den geldiğini doğrulayan güvenlik ara yazılımı.
        app.UseMiddleware<InternalGatewayHeaderMiddleware>();
        
        // Uygulamaya gelen isteklerin Serilog ile detaylıca loglanmasını sağlar (Metot, URL, süre, vb.).
        app.UseSerilogRequestLogging();
        return app;
    }
}
