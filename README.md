# FocusFlow

FocusFlow is a comprehensive study tracking application designed to help users monitor their study sessions, visualize their progress, and improve their productivity. It combines a robust Python backend with a clean, responsive frontend to provide a seamless user experience.

## Features

*   **User Management**: Secure registration, login, and profile management systems.
*   **Study Session Tracking**: Log detailed study sessions including start/end times, duration, and self-assessed quality.
*   **Dashboard Analytics**: Visual feedback on your study habits and completion metrics.
*   **Session History**: A detailed log of all past study sessions for review.
*   **Responsive Interface**: Custom-styled frontend ensuring usability across devices.

## Tech Stack

### Backend
*   **Language**: Python
*   **Framework**: FastAPI - For high-performance API endpoints.
*   **Database**: PostgreSQL - Robust relational database storage.
*   **ORM**: SQLAlchemy - For database modeling and interactions.

### Frontend
*   **Core**: HTML5, CSS3, JavaScript (ES6+).
*   **Architecture**: Vanilla JS with modular structure (`api.js`, `auth.js`, `components.js`).

## Setup

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate the virtual environment
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# macOS/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt


