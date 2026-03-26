using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PulseNet.BuildingBlocks.Middleware;
using Serilog;

namespace PulseNet.BuildingBlocks;

/// <summary>
/// Projedeki tüm mikroservisler için ortak olan varsayılan yapılandırmaları ve ara yazılımları (middleware) barındırır.
/// </summary>
public static class ServiceDefaults
{
    /// <summary>
    /// Servis oluşturulurken Serilog loglaması gibi standart hizmetleri uygulama bağımlılıklarına (DI) ekler.
    /// </summary>
    /// <param name="builder">Web uygulaması oluşturucu nesnesi.</param>
    /// <returns>Servisleri eklenmiş WebApplicationBuilder nesnesi döner.</returns>
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

    /// <summary>
    /// HTTP istekleri (Request Pipeline) sırasında çalışması gereken zorunlu ortak ara yazılımları ekler.
    /// Correlation ID takibi, İç Gateway doğrulaması ve Serilog istek loglaması işlemlerini içerir.
    /// </summary>
    /// <param name="app">Web uygulaması nesnesi.</param>
    /// <returns>Ara yazılımları (middleware) eklenmiş WebApplication nesnesi döner.</returns>
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
