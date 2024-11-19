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

## Folder Structure

```
backend/
├── database.db       # SQLite database file
├── index.js          # Express API backend
├── public/
│   └── index.html    # Frontend HTML file
└── package.json      # Node.js project configuration
```

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
   ```plaintext
   http://localhost:3000/index.html
   ```

5. **Test Functionality**:
   - View items in the "Beans" category.
   - Add new items using the input box.
   - Refresh the list to see updated items.

## Next Steps

### Step 6: React Prototype
The next stage of development will integrate a React-based UI for enhanced functionality, mobile responsiveness, and a more scalable codebase.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
