const { Op } = require("sequelize");
const Task    = require("../models/Task");

// GET /tasks?search=&status=&sort=asc|desc&page=1&limit=5
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search = "", status = "", sort = "desc", page = 1, limit = 5 } = req.query;

    const where = { user_id: userId };

    if (search.trim()) {
      where[Op.or] = [
        { title:       { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status && status !== "All") where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Task.findAndCountAll({
      where,
      order:  [["created_at", sort === "asc" ? "ASC" : "DESC"]],
      limit:  parseInt(limit),
      offset,
    });

    res.json({
      tasks:      rows,
      total:      count,
      page:       parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// GET /tasks/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [total, pending, inProgress, completed] = await Promise.all([
      Task.count({ where: { user_id: userId } }),
      Task.count({ where: { user_id: userId, status: "Pending" } }),
      Task.count({ where: { user_id: userId, status: "In Progress" } }),
      Task.count({ where: { user_id: userId, status: "Completed" } }),
    ]);
    res.json({ total, pending, inProgress, completed });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// POST /tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    if (!title || !description)
      return res.status(400).json({ message: "Title and description are required." });
    const task = await Task.create({ user_id: req.user.id, title, description, status });
    res.status(201).json(task);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// PUT /tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!task) return res.status(404).json({ message: "Task not found." });
    await task.update({ status: req.body.status });
    res.json(task);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// DELETE /tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!task) return res.status(404).json({ message: "Task not found." });
    await task.destroy();
    res.json({ message: "Task deleted successfully." });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
