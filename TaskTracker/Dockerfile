FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS builder

WORKDIR /app

COPY TaskTracker.csproj ./

RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore TaskTracker.csproj

COPY . ./

RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet publish TaskTracker.csproj -c Release -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runner

WORKDIR /app

COPY --from=builder --chown=app:app /app/publish ./

USER app

ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=true

EXPOSE 8080

ENTRYPOINT ["dotnet", "TaskTracker.dll"]