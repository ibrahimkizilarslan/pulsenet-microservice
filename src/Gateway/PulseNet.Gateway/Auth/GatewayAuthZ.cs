using System.Security.Claims;

namespace PulseNet.Gateway.Auth;

public sealed class GatewayAuthZ
{
    private readonly ILogger<GatewayAuthZ> _logger;

    public GatewayAuthZ(ILogger<GatewayAuthZ> logger)
    {
        _logger = logger;
    }

    public bool IsAuthenticated(HttpContext context)
    {
        var isAuthenticated = context.User.Identity?.IsAuthenticated ?? false;
        if (!isAuthenticated)
        {
            _logger.LogWarning("Unauthenticated request to {Path}", context.Request.Path);
        }
        return isAuthenticated;
    }

    public bool HasRequiredRole(HttpContext context, string[] allowedRoles)
    {
        if (allowedRoles.Length == 0)
            return true;

        var userRoles = context.User.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var hasRole = allowedRoles.Any(role => userRoles.Contains(role));

        if (!hasRole)
        {
            _logger.LogWarning("User lacks required role. Required: [{Roles}], Has: [{UserRoles}]",
                string.Join(", ", allowedRoles), string.Join(", ", userRoles));
        }

        return hasRole;
    }
}
