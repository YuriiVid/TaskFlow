FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS development
COPY . /source
WORKDIR /source
CMD dotnet watch run --no-launch-profile
