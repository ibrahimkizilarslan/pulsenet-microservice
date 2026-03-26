FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Directory.Build.props", "./"]
COPY ["src/BuildingBlocks/PulseNet.BuildingBlocks/PulseNet.BuildingBlocks.csproj", "src/BuildingBlocks/PulseNet.BuildingBlocks/"]
COPY ["src/Services/Timeline/PulseNet.Timeline.Api/PulseNet.Timeline.Api.csproj", "src/Services/Timeline/PulseNet.Timeline.Api/"]
RUN dotnet restore "src/Services/Timeline/PulseNet.Timeline.Api/PulseNet.Timeline.Api.csproj"

COPY src/BuildingBlocks/ src/BuildingBlocks/
COPY src/Services/Timeline/ src/Services/Timeline/
WORKDIR /src/src/Services/Timeline/PulseNet.Timeline.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5005
ENV ASPNETCORE_URLS=http://+:5005
ENTRYPOINT ["dotnet", "PulseNet.Timeline.Api.dll"]
