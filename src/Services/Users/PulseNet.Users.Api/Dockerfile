FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY Directory.Build.props ./
COPY ["src/BuildingBlocks/PulseNet.BuildingBlocks/PulseNet.BuildingBlocks.csproj", "src/BuildingBlocks/PulseNet.BuildingBlocks/"]
COPY ["src/Services/Users/PulseNet.Users.Api/PulseNet.Users.Api.csproj", "src/Services/Users/PulseNet.Users.Api/"]
RUN dotnet restore "src/Services/Users/PulseNet.Users.Api/PulseNet.Users.Api.csproj"

COPY src/BuildingBlocks/ src/BuildingBlocks/
COPY src/Services/Users/ src/Services/Users/
WORKDIR /src/src/Services/Users/PulseNet.Users.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5002
ENV ASPNETCORE_URLS=http://+:5002
ENTRYPOINT ["dotnet", "PulseNet.Users.Api.dll"]
