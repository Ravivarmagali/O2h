require("dotenv").config();

const express  = require("express");
const cors     = require("cors");
const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const auth       = require("./middleware/authMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth",  authRoutes);
app.use("/tasks", auth, taskRoutes);

if (require.main === module) {
  sequelize.sync().then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server Running on Port ${process.env.PORT}`)
    );
  }).catch((e) => console.error("DB Error:", e.message));
}

module.exports = app;
