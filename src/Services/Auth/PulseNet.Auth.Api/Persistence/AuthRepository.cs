using MongoDB.Driver;
using PulseNet.Auth.Api.Domain;

namespace PulseNet.Auth.Api.Persistence;

public sealed class AuthRepository
{
    private readonly IMongoCollection<UserCredential> _collection;

    public AuthRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<UserCredential>("credentials");
    }

    public async Task<UserCredential?> GetByUsernameAsync(string username)
    {
        return await _collection.Find(u => u.Username == username).FirstOrDefaultAsync();
    }

    public async Task CreateAsync(UserCredential credential)
    {
        await _collection.InsertOneAsync(credential);
    }
}
