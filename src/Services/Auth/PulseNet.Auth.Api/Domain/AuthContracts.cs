namespace PulseNet.Auth.Api.Domain;

public sealed record RegisterRequest(string Username, string Password, string? AdminSecret = null);
public sealed record LoginRequest(string Username, string Password);
public sealed record AuthResponse(string Token, string Username);
