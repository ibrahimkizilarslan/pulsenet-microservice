using PulseNet.Posts.Api.Domain;
using PulseNet.Posts.Api.Persistence;

namespace PulseNet.Posts.Api.Endpoints;

public static class PostsEndpoints
{
    public static void MapPostsEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/posts");

        group.MapGet("/", async (PostsRepository repo) =>
        {
            var posts = await repo.GetAllAsync();
            return Results.Ok(posts);
        });

        group.MapGet("/{id}", async (string id, PostsRepository repo) =>
        {
            var post = await repo.GetByIdAsync(id);
            return post is null ? Results.NotFound() : Results.Ok(post);
        });

        group.MapGet("/by-author/{authorId}", async (string authorId, PostsRepository repo) =>
        {
            var posts = await repo.GetByAuthorAsync(authorId);
            return Results.Ok(posts);
        });

        group.MapGet("/recent", async (PostsRepository repo) =>
        {
            var posts = await repo.GetRecentAsync();
            return Results.Ok(posts);
        });

        group.MapPost("/", async (CreatePostRequest request, PostsRepository repo) =>
        {
            var post = new Post
            {
                AuthorId = request.AuthorId,
                Content = request.Content,
                Tags = request.Tags ?? []
            };
            await repo.CreateAsync(post);
            return Results.Created($"/api/posts/{post.Id}", post);
        });

        group.MapPut("/{id}", async (string id, UpdatePostRequest request, PostsRepository repo) =>
        {
            var post = await repo.GetByIdAsync(id);
            if (post is null) return Results.NotFound();

            post.Content = request.Content;
            post.Tags = request.Tags ?? post.Tags;
            post.UpdatedAt = DateTime.UtcNow;
            await repo.UpdateAsync(post);
            return Results.Ok(post);
        });

        group.MapDelete("/{id}", async (string id, PostsRepository repo) =>
        {
            var deleted = await repo.DeleteAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        group.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "posts" }));
    }
}
