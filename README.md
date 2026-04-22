# Assignment Management System

A full-stack, modern web application designed to streamline the assignment workflow between teachers and students. This platform allows educators to create assignments and manage submissions, while providing students with a seamless interface to view tasks and upload their work.

## 🚀 Features

### For Faculty (Teachers)
- **Dashboard:** Overview of active and past assignments.
- **Assignment Creation:** Easily create assignments with titles, descriptions, and due dates.
- **Submission Tracking:** View all student submissions for each assignment in one place.

### For Students
- **Dashboard:** View pending and completed assignments.
- **File Uploads:** Securely upload assignment files (documents, images, etc.).
- **Deadline Tracking:** Keep track of assignment due dates.

### General
- **Secure Authentication:** Role-based access control (Faculty vs. Student).
- **Modern UI:** Premium, responsive design with glassmorphism aesthetics.
- **Robust Backend:** Built with Node.js, Express, and TypeScript.
- **File Management:** Efficient handling of file uploads and storage.

## 🛠️ Tech Stack

- **Frontend:** HTML5, Vanilla CSS (Modern Design, Glassmorphism), Vanilla JavaScript
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB (Mongoose)
- **File Uploads:** Multer
- **Development:** `ts-node-dev`

## ⚙️ Prerequisites

Make sure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Running locally or a MongoDB Atlas URI)

## 🏃‍♂️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Clone the Repository
```bash
git clone https://github.com/abhi940927/AssignmentManagerSystem.git
cd AssignmentManagerSystem
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
*(Note: Replace `your_mongodb_connection_string` and `your_jwt_secret_key` with your actual MongoDB URI and a secure random string.)*

### 4. Run the Application
Start the development server:
```bash
npm run dev
```

The server will start, typically on `http://localhost:8080`.

## 📂 Project Structure

```
├── public/                 # Frontend assets (HTML, CSS, JS)
│   ├── css/                # Styling files
│   ├── js/                 # Client-side JavaScript
│   ├── faculty/            # Faculty dashboard views
│   └── student/            # Student dashboard views
├── server/                 # Backend source code (TypeScript)
│   ├── index.ts            # Application entry point
│   ├── routes/             # Express API routes
│   ├── models/             # MongoDB schema models (Mongoose)
│   ├── middleware/         # Custom Express middleware (Auth, etc.)
│   └── services/           # Background services (Cron jobs, etc.)
├── uploads/                # Directory for uploaded assignment files
├── .gitignore              # Ignored files for Git
├── package.json            # Node.js dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/abhi940927/AssignmentManagerSystem/issues).

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
