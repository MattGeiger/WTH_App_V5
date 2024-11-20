# SQL-React-App

A simple web application demonstrating a closed-loop interaction between a SQL database backend and a lightweight frontend interface. This project provides a foundation for a React-based UI with read and write functionality to a SQL database.

## Features

- **SQL Backend**: SQLite database with data management capabilities.
- **Express API**: Node.js backend using Express.js to handle read (`GET`) and write (`POST`) operations.
- **Frontend Interface**: A lightweight HTML/JavaScript interface for testing database interactions.

## Current Functionality

### 1. **Read Operation**
Queries the database for items in the "Beans" category (filtered by the `english_category` column) and displays them in a simple list.

### 2. **Write Operation**
Allows users to:
- Add new items to the "Beans" category via a text input box and "Add New" button.
- Refresh the displayed list to include the newly added items using a "Refresh" button.

### 3. **Closed-Loop Interaction**
The frontend can:
- Read data from the SQL database.
- Write new data back to the database.
- Refresh dynamically to display updates.

---

## Completed Steps

1. **GitHub Project Setup**:
   - A repository was created to serve as the foundation for the project.
   - Project syncs automatically with a developer environment (Codespaces).

2. **SQL Database Setup**:
   - Converted the original MySQL `.sql` file to SQLite format for compatibility.
   - Verified the database schema and data.

3. **API Development**:
   - Developed an Express-based API with `GET` and `POST` endpoints to interact with the SQL database.

4. **Frontend Interface**:
   - Built a lightweight frontend using HTML and JavaScript.
   - Successfully implemented functionality to read from and write to the SQL database.

---

## Remaining Tasks

### 1. **Step 6: Integrate OpenAI-Powered Translations**:
   - Enhance the `POST` endpoint to send translation requests to OpenAI's API when new items are added.
   - Use nuanced and culturally appropriate translations for target languages (e.g., Russian, Ukrainian, Spanish, etc.).
   - Update the database with translated versions of the English input.

### 2. **Step 7: Validate React Prototype**:
   - Test the existing React prototype for mobile responsiveness and overall functionality.
   - Identify areas that need improvement before proceeding to full development.

### 3. **Step 8: Develop a Production-Ready React Frontend**:
   - Build a scalable and user-friendly web app UI using React.
   - Ensure responsive design for both mobile and desktop devices.
   - Implement category-based queries, real-time refresh, and user-friendly forms for new entries.

### 4. **Step 9: Deployment and Testing**:
   - Deploy the app to a live environment (e.g., Netlify, AWS, or Vercel).
   - Conduct thorough testing to validate the integration of the SQL backend, API, and React frontend.

### 5. **Step 10: Iterate and Optimize**:
   - Address any inefficiencies or feedback identified during testing.
   - Optimize translation requests and backend functionality for performance and cost.

---

## Folder Structure

```
backend/
├── database.db       # SQLite database file
├── index.js          # Express API backend
├── public/
│   └── index.html    # Frontend HTML file
└── package.json      # Node.js project configuration
```

---

## How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your system.
- SQLite installed (already included in most systems).

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/sql-react-app.git
   cd sql-react-app/backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Server**:
   ```bash
   node index.js
   ```

4. **Access the Application**:
   Open your browser and navigate to:
   ```
   http://localhost:3000/index.html
   ```

5. **Test Functionality**:
   - **View Items**: The list will display all items in the "Beans" category.
   - **Add Items**: Use the text input box and "Add New" button to add items to the "Beans" category.
   - **Refresh**: Click the "Refresh" button to reload and view the updated list of items.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.