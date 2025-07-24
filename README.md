# Taskflow

TaskFlow is a Kanban-style task management application built as a web-based project using ASP.NET Core for the backend and React for the frontend. It allows users to organize work into a board of columns and cards, where each card represents a task that moves through workflow stages.  The backend is a RESTful API built with ASP.NET Core Web API and provides endpoints to create, update, delete and retrieve tasks in a database. The frontend is a single-page application built with React with TypeSscript using Vite, enabling a dynamic and responsive UI. TaskFlow was developed as a demonstration and learning project in ASP.NET Core and ReactJS, showcasing modern full-stack development with container support and continuous deployment practices.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need the following installed on your system before running TaskFlow:
- .NET SDK (9.0 or newer) – to build and run the ASP.NET Core backend
- Node.js (23.11 or LTS) – to build the React frontend
- npm – package manager for the frontend dependencies
- (Optional) Docker & Docker Compose – for running the app in containers with one command
- PostgreSQL (17.2)  – used by the ASP.NET Core API to store tasks (configuration in appsettings.json).

### Installing

#### 1. Clone the repository:

```bash
git clone https://github.com/YuriiVid/TaskFlow.git
cd TaskFlow
```

#### 2. Add certificates for HTTPS:

#### API

On Windows:
```bash
dotnet dev-certs https -ep "$env:USERPROFILE\.aspnet\https\aspnetapp.pfx"  -p $CREDENTIAL_PLACEHOLDER$
dotnet dev-certs https --trust
```

On Linux:
```bash
dotnet dev-certs https -ep ${HOME}/.aspnet/https/aspnetapp.pfx"  -p $CREDENTIAL_PLACEHOLDER
dotnet dev-certs https --trust
```

#### Frontend

On Windows:
```bash
.\mkcert.exe --install
.\mkcert.exe -key-file frontend\certs\key.pem -cert-file frontend\certs\cert.pem localhost 127.0.0.1 ::1
```
On Linux:
```bash 
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert
rm mkcert-v*-linux-amd64
```
This will download and setup mkcert pre-built binary, then run:
```bash
mkcert -install
mkdir frontend/certs
mkcert -key-file frontend/certs/key.pem -cert-file frontend/certs/cert.pem localhost 127.0.0.1 ::1
```
#### 3. Copy the example environment files and edit them with your own values:

```bash
cp API/.config/api_example.env .env     # For ASP.NET Core backend
cp API/.config/db_example.env db.env    # For PostgreSQL
cp frontend/example.env frontend/.env   # For React frontend
```
Edit these files to match your local or production setup. See [Environment Configuration](#environment-configuration) for details.

#### 4. Run with Docker Compose (all-in-one):

```bash
docker compose up -d
```
This spins up the PostgreSQL database, API, and React frontend using the configured environment variables.

#### 5. Or run without Docker:

Backend (ASP.NET Core API):

```bash
dotnet restore
dotnet run
```
Frontend (React):

```bash
cd frontend
npm install
npm run dev
```
Open the app:

- Frontend: http://localhost:3000
- API: http://localhost:8001 (or configured in .env)

Environment

## Environment Configuration

To run this project, you will need to add the following environment variables to your .env file

| **File**        | **Variable**                                          | **Description**                  | **Example**              |
| --------------- | ----------------------------------------------------- | -------------------------------- | ------------------------ |
| `.env` (API)    | `ASPNETCORE_ENVIRONMENT`                              | ASP.NET environment              | `Development`            |
|                 | `ASPNETCORE_URLS`                                     | URLs to bind the server to       | `https://localhost:8001` |
|                 | `ASPNETCORE_HTTPS_PORTS`                              | HTTPS port                       | `8001`                   |
|                 | `ASPNETCORE_Kestrel__Certificates__Default__Password` | Password for HTTPS certificate   | `yourpassword`           |
|                 | `ASPNETCORE_Kestrel__Certificates__Default__Path`     | Path to the `.pfx` file          | `./localhost.pfx`        |
|                 | `TZ`                                                  | Timezone                         | `UTC`            |
| `db.env`        | `POSTGRES_USER`                                       | Database username                | `taskflow`               |
|                 | `POSTGRES_PASSWORD`                                   | Database password                | `supersecret`            |
|                 | `POSTGRES_DB`                                         | Name of the database             | `taskflowdb`             |
| `frontend/.env` | `NODE_ENV`                                            | Frontend environment             | `development`            |
|                 | `VITE_API_URL`                                        | Backend API base URL             | `https://localhost:5001` |
|                 | `VITE_UPLOADS_PATH`                                   | Path for file uploads (optional) | `/uploads`               |


## Built With

* [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) – The web framework used for the backend API
* [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core) – ORM for database access (used with PostgreSQL)
* [React](https://react.dev) – JavaScript library for building the frontend user interface
* [TypeScript](https://www.typescriptlang.org) – Typed superset of JavaScript, used in the React frontend
* [Vite](https://vite.dev) –Lightning-fast frontend build tool for React
* [npm](https://www.npmjs.com) – Package manager for the frontend dependencies.
* [Docker](https://www.docker.com) – Container platform used for development and deployment (via Docker Compose)

## Authors

* **Yurii Vidoniak** - *Initial work* - [YuriiVid](https://github.com/YuriiVid)

See also the list of [contributors](https://github.com/YuriiVid/TaskFlow/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgements

* Inspiration and guidance from Atlassian’s Kanban overview and other resources on kanban boards
* Based on patterns and tutorials (e.g. fernandovmp/kanban-board) for learning ASP.NET Core and React
* Thanks to the open-source community for libraries and tools (such as Docker, .NET, React) that made this project possible.