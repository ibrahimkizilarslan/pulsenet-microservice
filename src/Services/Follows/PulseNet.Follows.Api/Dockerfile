FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/BuildingBlocks/PulseNet.BuildingBlocks/PulseNet.BuildingBlocks.csproj", "src/BuildingBlocks/PulseNet.BuildingBlocks/"]
COPY ["src/Services/Follows/PulseNet.Follows.Api/PulseNet.Follows.Api.csproj", "src/Services/Follows/PulseNet.Follows.Api/"]
RUN dotnet restore "src/Services/Follows/PulseNet.Follows.Api/PulseNet.Follows.Api.csproj"

COPY src/BuildingBlocks/ src/BuildingBlocks/
COPY src/Services/Follows/ src/Services/Follows/
WORKDIR /src/src/Services/Follows/PulseNet.Follows.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5004
ENV ASPNETCORE_URLS=http://+:5004
ENTRYPOINT ["dotnet", "PulseNet.Follows.Api.dll"]
