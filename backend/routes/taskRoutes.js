const express = require("express");
const router  = express.Router();
const { getTasks, getStats, createTask, updateTask, deleteTask } = require("../controllers/taskController");

router.get("/",        getTasks);
router.get("/stats",   getStats);
router.post("/",       createTask);
router.put("/:id",     updateTask);
router.delete("/:id",  deleteTask);

module.exports = router;
