using MongoDB.Driver;
using PulseNet.Posts.Api.Domain;

namespace PulseNet.Posts.Api.Persistence;

public sealed class PostsRepository
{
    private readonly IMongoCollection<Post> _collection;

    public PostsRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<Post>("posts");
    }

    public async Task<Post?> GetByIdAsync(string id) =>
        await _collection.Find(p => p.Id == id).FirstOrDefaultAsync();

    public async Task<List<Post>> GetByAuthorAsync(string authorId) =>
        await _collection.Find(p => p.AuthorId == authorId)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();

    public async Task<List<Post>> GetRecentAsync(int limit = 50) =>
        await _collection.Find(_ => true)
            .SortByDescending(p => p.CreatedAt)
            .Limit(limit)
            .ToListAsync();

    public async Task CreateAsync(Post post) =>
        await _collection.InsertOneAsync(post);

    public async Task UpdateAsync(Post post) =>
        await _collection.ReplaceOneAsync(p => p.Id == post.Id, post);

    public async Task DeleteAsync(string id) =>
        await _collection.DeleteOneAsync(p => p.Id == id);
}
