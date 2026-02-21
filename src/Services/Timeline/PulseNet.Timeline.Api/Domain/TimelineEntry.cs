using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PulseNet.Timeline.Api.Domain;

public sealed class TimelineEntry
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string PostId { get; set; } = null!;
    public string AuthorId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime PostCreatedAt { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
