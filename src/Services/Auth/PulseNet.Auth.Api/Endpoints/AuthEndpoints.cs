using PulseNet.Auth.Api.Domain;
using PulseNet.Auth.Api.Persistence;
using PulseNet.BuildingBlocks.Auth;

namespace PulseNet.Auth.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", async (RegisterRequest request, AuthRepository repo, JwtTokenGenerator tokenGenerator) =>
        {
            var existing = await repo.GetByUsernameAsync(request.Username);
            if (existing is not null)
                return Results.Conflict(new { error = "Username already exists." });

            var credential = new UserCredential
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "User"
            };

            await repo.CreateAsync(credential);

            var token = tokenGenerator.GenerateToken(credential.Id, credential.Username, credential.Role);
            return Results.Created($"/api/auth/{credential.Id}", new AuthResponse(token, credential.Username));
        });

        group.MapPost("/login", async (LoginRequest request, AuthRepository repo, JwtTokenGenerator tokenGenerator) =>
        {
            var credential = await repo.GetByUsernameAsync(request.Username);
            if (credential is null || !BCrypt.Net.BCrypt.Verify(request.Password, credential.PasswordHash))
                return Results.Unauthorized();

            var token = tokenGenerator.GenerateToken(credential.Id, credential.Username, credential.Role);
            return Results.Ok(new AuthResponse(token, credential.Username));
        });

        group.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "auth" }));
    }
}
