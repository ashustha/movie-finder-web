# Movie Finder

**Movie Finder** is a web application built using **Node.js**, **React**, **React Bootstrap**, and **TypeScript**. It allows users to search for movies, view detailed information, and save their favorite movies for easy access.

## Features

- **Search:** Users can search for movies by title, genre, actor, or other criteria.
- **Movie Details:** Provides a comprehensive overview of each movie, including plot summary, cast, ratings, etc.
- **Favorites List:** Users can save their favorite movies for quick access later.
- **Responsive Design:** Fully functional across desktop and mobile devices.

## Technologies Used

- **Node.js** – Server-side runtime environment.
- **React** – Frontend JavaScript library for building user interfaces.
- **React Bootstrap** – Responsive, mobile-first UI framework.
- **TypeScript** – Superset of JavaScript with static types for better code quality.

## Installation Guide

Follow the steps below to install and run the project:

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/sihe-mit651-24S1/capstone-project-team-2.git
```

Navigate to the project directory:

```bash
cd capstone-project-team-2-main
```

### 2. Install Dependencies

#### Client Setup

Navigate to the `client` folder and install the dependencies:

```bash
cd client
npm install
```

#### Server Setup

Navigate to the `server` folder and install the dependencies:

```bash
cd ../server
npm install
```

#### Admin Panel Setup

Navigate to the `admin` folder and install the dependencies:

```bash
cd ../admin
npm install
```

### 3. Set Up the Database

1. Start **XAMPP** or another local server that includes Apache and MySQL.
2. Open [phpMyAdmin](http://localhost/phpmyadmin) in your browser.

3. Create a new database named **`mfs`**.

4. Import the database SQL file located in the root directory of the project.

   - Click on **Import** in phpMyAdmin.
   - Select the SQL file from the project folder.
   - Click **Go** to complete the import.

### 4. Running the Application

#### Start the Client

Navigate to the `client` directory and run the development server:

```bash
cd ../client
npm run dev
```

This will launch the client at `http://localhost:5173/`.

#### Start the Admin Panel

Navigate to the `admin` directory and start the admin panel:

```bash
cd ../admin
npm run dev
```

This will launch the admin panel at `http://localhost:5173/`.

**Admin Login Credentials:**

- **Username:** sihe@gmail.com
- **Password:** Australia@1234

#### Start the Server

Navigate to the `server` directory and start the backend server:

```bash
cd ../server
npm start
```

The backend API will be available at `http://localhost:3000/`.

### 5. Access the Application

Open your browser and go to:

- **Client Application:** `http://localhost:5173/`
- **Admin Panel:** `http://localhost:5173/`

## Notes

- Ensure that **Apache** and **MySQL** services are running in **XAMPP** before starting the application.
- If you encounter any issues related to missing dependencies or conflicting versions, try running:

  ```bash
  npm install --force
  ```
