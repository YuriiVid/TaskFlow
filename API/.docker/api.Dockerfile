FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS development
COPY . /source
WORKDIR /source
RUN apk add --no-cache libc6-compat curl bash

# 2) Download and install vsdbg
RUN mkdir /vsdbg \
 && curl -sSL https://aka.ms/getvsdbgsh \
    | sh /dev/stdin -v latest -l /vsdbg
	
CMD ["dotnet", "watch", "run", "--no-launch-profile"]
