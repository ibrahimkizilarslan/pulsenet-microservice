using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PulseNet.Posts.Api.Domain;

public sealed class Post
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    public string AuthorId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public List<string> Tags { get; set; } = [];
    public int LikeCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
