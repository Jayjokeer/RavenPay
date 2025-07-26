# Raven-Pay

A simple fintech API built with Express.js and MySQL.

---

## 🛠️ Installation & Setup

### 1. Prerequisites

Make sure the following tools are installed on your system:

- **Node.js** (v18 or later): [Download Node.js](https://nodejs.org/)
- **MySQL**
- **Knex CLI**:
  ```bash
  npm install -g knex
  ```

---

### 2. Clone the Repository

```bash
git clone https://github.com/Jayjokeer/RavenPay.git
cd ravenPay
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=3002
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ravenpay
JWT_SECRET=your_jwt_secret
RAVEN_URL_raven_url=your raven_url
RAVEN_API_KEY_SECRET=raven_pay_secret_key
```

> 💡 Make sure you create the `ravenpay` database in MySQL before running migrations.

---

### 5. Run Migrations

```bash
npm run migrate
```

This command sets up all the necessary tables in your database.

---

### 6. Start the Development Server

```bash
npm run dev
```

Your API will be running at:

```
http://localhost:3002
```

---

### 7. Run Tests

```bash
npm run test
```

This will run all test suites using Jest.

---

## 🚀 Technologies Used

- Node.js
- Express.js
- MySQL
- Knex.js
- Jest
- Supertest

---

## 📂 Folder Structure

```
raven-pay/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── db/
│   ├── middlewares/
    ├── server.ts
    ├── app.ts
│   └── ...
├── tests/
├── migrations/
├── .env
├── knexfile.ts
└── README.md
```

---

## 📮 API Reference

Check the full API documentation on [Postman Link](https://www.postman.com/dev-demons/workspace/public-workspace/collection/26660523-99bc3f30-840f-48fc-b115-04324744926a?action=share&creator=26660523)

---
---
