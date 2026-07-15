# LabWatch System Monitor

A real-time monitoring dashboard built with FastAPI and React.

> [!WARNING]
> **System Compatability:** This project was built and tested on **Windows**. While the Python code itself uses cross-platform libraries like `psutil`, the startup scripts (`.bat`) and setup instructions are Windows-specific. macOS/Linux users will need to run the commands and activate virtual environments manually.

## Features

- Real-time CPU, RAM, disk and network monitoring
- Agent and backend connectivity tracking
- Live metric visualisation
- Offline detection

## Prerequisites

Before running the project, ensure you have:

- Windows 10/11
- Python 3.11+
- Node.js 20+
- Git

## Installation

### 1. Clone the repository

```text
git clone https://github.com/userinit/LabWatch.git
cd LabWatch
```

### 2. Configure environment variables

Copy the example environment files and update them with your local configuration:

```text
backend/.env.example -> backend/.env
agent/.env.example -> agent/.env
```

### 3. Install backend and agent dependencies

Create and activate a Python virtual environment

```text
python -m venv venv
.\venv\Scripts\activate
```

Install Python dependencies:

```text
pip install -r requirements.txt
```

### 4. Install frontend dependencies

```text
cd .\frontend
npm install
```

## Running the application

Start the FastAPI and Vite servers:

```text
.\scripts\server_script.bat
```

Start the monitoring agent:
```text
.\scripts\agent_script.bat
```
