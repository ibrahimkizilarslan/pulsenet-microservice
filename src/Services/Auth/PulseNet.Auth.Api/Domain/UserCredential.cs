using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PulseNet.Auth.Api.Domain;

public sealed class UserCredential
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
