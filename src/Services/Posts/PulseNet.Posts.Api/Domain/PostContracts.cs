namespace PulseNet.Posts.Api.Domain;

public sealed record CreatePostRequest(string AuthorId, string Content, List<string>? Tags);
public sealed record UpdatePostRequest(string Content, List<string>? Tags);
