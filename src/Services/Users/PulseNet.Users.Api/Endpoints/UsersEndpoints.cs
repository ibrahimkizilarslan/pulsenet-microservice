using PulseNet.Users.Api.Domain;
using PulseNet.Users.Api.Persistence;

namespace PulseNet.Users.Api.Endpoints;

public static class UsersEndpoints
{
    public static void MapUsersEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/users");

        group.MapGet("/{id}", async (string id, UsersRepository repo) =>
        {
            var profile = await repo.GetByIdAsync(id);
            return profile is null ? Results.NotFound() : Results.Ok(profile);
        });

        group.MapGet("/by-username/{username}", async (string username, UsersRepository repo) =>
        {
            var profile = await repo.GetByUsernameAsync(username);
            return profile is null ? Results.NotFound() : Results.Ok(profile);
        });

        group.MapPost("/", async (CreateProfileRequest request, UsersRepository repo) =>
        {
            var profile = new UserProfile
            {
                Username = request.Username,
                DisplayName = request.DisplayName,
                Bio = request.Bio
            };
            await repo.CreateAsync(profile);
            return Results.Created($"/api/users/{profile.Id}", profile);
        });

        group.MapPut("/{id}", async (string id, UpdateProfileRequest request, UsersRepository repo) =>
        {
            var profile = await repo.GetByIdAsync(id);
            if (profile is null) return Results.NotFound();

            profile.DisplayName = request.DisplayName;
            profile.Bio = request.Bio;
            profile.AvatarUrl = request.AvatarUrl;
            profile.UpdatedAt = DateTime.UtcNow;
            await repo.UpdateAsync(profile);
            return Results.Ok(profile);
        });

        group.MapDelete("/{id}", async (string id, UsersRepository repo) =>
        {
            var deleted = await repo.DeleteAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        group.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "users" }));
    }
}
