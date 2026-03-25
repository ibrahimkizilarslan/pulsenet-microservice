using MongoDB.Driver;
using Moq;
using PulseNet.Gateway.Persistence;
using PulseNet.Gateway.Routing;

namespace PulseNet.Gateway.Tests;

public class RouteConfigPersistenceTests
{
    private class AsyncCursorMock<T> : IAsyncCursor<T>
    {
        private readonly IEnumerable<T> _items;
        private bool _moved;

        public AsyncCursorMock(IEnumerable<T> items)
        {
            _items = items;
        }

        public IEnumerable<T> Current => _items;

        public void Dispose() { }

        public bool MoveNext(CancellationToken cancellationToken = default)
        {
            if (_moved) return false;
            _moved = true;
            return true;
        }

        public Task<bool> MoveNextAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(MoveNext(cancellationToken));
    }

    [Fact]
    public async Task GetAllAsync_ReturnsRoutesFromCollection()
    {
        // Arrange
        var mockCollection = new Mock<IMongoCollection<RouteConfig>>();
        var mockDatabase = new Mock<IMongoDatabase>();
        
        var routes = new List<RouteConfig>
        {
            new() { Id = "1", PathPrefix = "/api/test", DownstreamHost = "http://test:5000", RequiresAuth = false }
        };

        var cursorMock = new AsyncCursorMock<RouteConfig>(routes);

        mockCollection.Setup(c => c.FindAsync(
            It.IsAny<FilterDefinition<RouteConfig>>(),
            It.IsAny<FindOptions<RouteConfig, RouteConfig>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(cursorMock);

        mockDatabase.Setup(d => d.GetCollection<RouteConfig>("routes", null))
            .Returns(mockCollection.Object);

        var repo = new RouteConfigRepository(mockDatabase.Object);

        // Act
        var result = await repo.GetAllAsync();

        // Assert
        Assert.Single(result);
        Assert.Equal("/api/test", result[0].PathPrefix);
    }

    [Fact]
    public async Task SeedIfEmptyAsync_WhenEmpty_InsertsDefaultRoutes()
    {
        // Arrange
        var mockCollection = new Mock<IMongoCollection<RouteConfig>>();
        var mockDatabase = new Mock<IMongoDatabase>();

        var emptyCursorMock = new AsyncCursorMock<RouteConfig>(new List<RouteConfig>());

        // Setup CountDocumentsAsync or FindAsync acting as emptiness check
        mockCollection.Setup(c => c.FindAsync(
            It.IsAny<FilterDefinition<RouteConfig>>(),
            It.IsAny<FindOptions<RouteConfig, RouteConfig>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyCursorMock);

        // Setup CountDocumentsAsync properly
        mockCollection.Setup(c => c.EstimatedDocumentCountAsync(It.IsAny<EstimatedDocumentCountOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        mockDatabase.Setup(d => d.GetCollection<RouteConfig>("routes", null))
            .Returns(mockCollection.Object);

        var repo = new RouteConfigRepository(mockDatabase.Object);
        var defaultRoutes = new List<RouteConfig>
        {
            new() { PathPrefix = "/api/seed", DownstreamHost = "http://seed:5000" }
        };

        // Act
        await repo.SeedIfEmptyAsync(defaultRoutes);

        // Assert
        mockCollection.Verify(c => c.InsertManyAsync(
            defaultRoutes, 
            It.IsAny<InsertManyOptions>(), 
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }
}
