using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PulseNet.Follows.Api.Domain;

public sealed class Follow
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    public string FollowerId { get; set; } = null!;
    public string FolloweeId { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
