namespace PulseNet.Timeline.Api.Domain;

public sealed record AddTimelineEntryRequest(
    string UserId,
    string PostId,
    string AuthorId,
    string Content,
    DateTime PostCreatedAt);
