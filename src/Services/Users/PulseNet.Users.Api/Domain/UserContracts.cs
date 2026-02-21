namespace PulseNet.Users.Api.Domain;

public sealed record CreateProfileRequest(string Username, string DisplayName, string Bio);
public sealed record UpdateProfileRequest(string DisplayName, string Bio, string AvatarUrl);
