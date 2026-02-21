FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/BuildingBlocks/PulseNet.BuildingBlocks/PulseNet.BuildingBlocks.csproj", "src/BuildingBlocks/PulseNet.BuildingBlocks/"]
COPY ["src/Services/Posts/PulseNet.Posts.Api/PulseNet.Posts.Api.csproj", "src/Services/Posts/PulseNet.Posts.Api/"]
RUN dotnet restore "src/Services/Posts/PulseNet.Posts.Api/PulseNet.Posts.Api.csproj"

COPY src/BuildingBlocks/ src/BuildingBlocks/
COPY src/Services/Posts/ src/Services/Posts/
WORKDIR /src/src/Services/Posts/PulseNet.Posts.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5003
ENV ASPNETCORE_URLS=http://+:5003
ENTRYPOINT ["dotnet", "PulseNet.Posts.Api.dll"]
