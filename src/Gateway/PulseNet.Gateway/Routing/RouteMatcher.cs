namespace PulseNet.Gateway.Routing;

public sealed class RouteMatcher
{
    private readonly RouteTable _routeTable;

    public RouteMatcher(RouteTable routeTable)
    {
        _routeTable = routeTable;
    }

    public RouteConfig? Match(string requestPath, string method)
    {
        if (string.IsNullOrWhiteSpace(requestPath))
            return null;

        return _routeTable.Routes.FirstOrDefault(r =>
            requestPath.StartsWith(r.PathPrefix, StringComparison.OrdinalIgnoreCase) &&
            (r.AllowedMethods.Length == 0 || r.AllowedMethods.Contains(method, StringComparer.OrdinalIgnoreCase)));
    }

    public string BuildDownstreamUrl(RouteConfig route, string requestPath, string? queryString)
    {
        var downstream = route.DownstreamHost.TrimEnd('/') + requestPath;
        if (!string.IsNullOrEmpty(queryString))
            downstream += queryString;
        return downstream;
    }
}
