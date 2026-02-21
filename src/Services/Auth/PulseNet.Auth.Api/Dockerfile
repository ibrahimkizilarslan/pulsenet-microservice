FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/BuildingBlocks/PulseNet.BuildingBlocks/PulseNet.BuildingBlocks.csproj", "src/BuildingBlocks/PulseNet.BuildingBlocks/"]
COPY ["src/Services/Auth/PulseNet.Auth.Api/PulseNet.Auth.Api.csproj", "src/Services/Auth/PulseNet.Auth.Api/"]
RUN dotnet restore "src/Services/Auth/PulseNet.Auth.Api/PulseNet.Auth.Api.csproj"

COPY src/BuildingBlocks/ src/BuildingBlocks/
COPY src/Services/Auth/ src/Services/Auth/
WORKDIR /src/src/Services/Auth/PulseNet.Auth.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5001
ENV ASPNETCORE_URLS=http://+:5001
ENTRYPOINT ["dotnet", "PulseNet.Auth.Api.dll"]
