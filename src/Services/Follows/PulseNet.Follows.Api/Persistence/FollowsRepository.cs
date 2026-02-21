using MongoDB.Driver;
using PulseNet.Follows.Api.Domain;

namespace PulseNet.Follows.Api.Persistence;

public sealed class FollowsRepository
{
    private readonly IMongoCollection<Follow> _collection;

    public FollowsRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<Follow>("follows");
    }

    public async Task<List<Follow>> GetFollowersAsync(string userId) =>
        await _collection.Find(f => f.FolloweeId == userId).ToListAsync();

    public async Task<List<Follow>> GetFollowingAsync(string userId) =>
        await _collection.Find(f => f.FollowerId == userId).ToListAsync();

    public async Task<bool> IsFollowingAsync(string followerId, string followeeId) =>
        await _collection.Find(f => f.FollowerId == followerId && f.FolloweeId == followeeId).AnyAsync();

    public async Task CreateAsync(Follow follow) =>
        await _collection.InsertOneAsync(follow);

    public async Task DeleteAsync(string followerId, string followeeId) =>
        await _collection.DeleteOneAsync(f => f.FollowerId == followerId && f.FolloweeId == followeeId);
}
