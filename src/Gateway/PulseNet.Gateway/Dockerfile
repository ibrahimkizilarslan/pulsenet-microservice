FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Directory.Build.props", "./"]

COPY ["src/BuildingBlocks/PulseNet.BuildingBlocks/PulseNet.BuildingBlocks.csproj", "src/BuildingBlocks/PulseNet.BuildingBlocks/"]
COPY ["src/Gateway/PulseNet.Gateway/PulseNet.Gateway.csproj", "src/Gateway/PulseNet.Gateway/"]
RUN dotnet restore "src/Gateway/PulseNet.Gateway/PulseNet.Gateway.csproj"

COPY src/BuildingBlocks/ src/BuildingBlocks/
COPY src/Gateway/ src/Gateway/
WORKDIR /src/src/Gateway/PulseNet.Gateway
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "PulseNet.Gateway.dll"]
