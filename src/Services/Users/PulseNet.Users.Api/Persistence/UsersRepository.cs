using MongoDB.Driver;
using PulseNet.Users.Api.Domain;

namespace PulseNet.Users.Api.Persistence;

public sealed class UsersRepository
{
    private readonly IMongoCollection<UserProfile> _collection;

    public UsersRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<UserProfile>("profiles");
    }

    public async Task<UserProfile?> GetByIdAsync(string id) =>
        await _collection.Find(u => u.Id == id).FirstOrDefaultAsync();

    public async Task<UserProfile?> GetByUsernameAsync(string username) =>
        await _collection.Find(u => u.Username == username).FirstOrDefaultAsync();

    public async Task CreateAsync(UserProfile profile) =>
        await _collection.InsertOneAsync(profile);

    public async Task UpdateAsync(UserProfile profile) =>
        await _collection.ReplaceOneAsync(u => u.Id == profile.Id, profile);

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(u => u.Id == id);
        return result.DeletedCount > 0;
    }
}
