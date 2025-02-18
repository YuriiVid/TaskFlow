FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS migration
COPY . /source
WORKDIR /source
RUN dotnet restore
ENV PATH $PATH:/root/.dotnet/tools
RUN dotnet tool install -g dotnet-ef  --version 9.0.1
ENTRYPOINT ["dotnet", "ef", "database", "update"]
