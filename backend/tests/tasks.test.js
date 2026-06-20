require("dotenv").config();
const request   = require("supertest");
const app       = require("../server");
const sequelize = require("../config/db");

let token;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Register + login to get token
  await request(app).post("/auth/register").send({
    name: "Task Tester", email: "tasks@o2h.com", password: "pass1234"
  });
  const res = await request(app).post("/auth/login").send({
    email: "tasks@o2h.com", password: "pass1234"
  });
  token = res.body.token;

  // Seed tasks
  const tasks = [
    { title: "Buy groceries",   description: "Milk and eggs",          status: "Pending"     },
    { title: "Fix login bug",   description: "OAuth redirect issue",   status: "In Progress" },
    { title: "Write tests",     description: "Unit tests for API",     status: "Completed"   },
    { title: "Update README",   description: "Add setup instructions", status: "Pending"     },
    { title: "Deploy to prod",  description: "Push to production",     status: "Completed"   },
    { title: "Review PRs",      description: "Check open pull reqs",   status: "Pending"     },
  ];
  for (const t of tasks) {
    await request(app).post("/tasks").set("Authorization", `Bearer ${token}`).send(t);
  }
});

afterAll(async () => {
  await sequelize.close();
});

describe("Tasks API", () => {

  // --- CREATE ---
  test("POST /tasks — creates a task", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New task", description: "Desc", status: "Pending" });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("New task");
  });

  test("POST /tasks — rejects missing title", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "No title" });
    expect(res.statusCode).toBe(400);
  });

  test("POST /tasks — rejects unauthenticated request", async () => {
    const res = await request(app).post("/tasks").send({ title: "T", description: "D" });
    expect(res.statusCode).toBe(401);
  });

  // --- READ / SEARCH ---
  test("GET /tasks — returns paginated tasks", async () => {
    const res = await request(app)
      .get("/tasks?page=1&limit=5")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("tasks");
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("totalPages");
    expect(res.body.tasks.length).toBeLessThanOrEqual(5);
  });

  test("GET /tasks — search by keyword", async () => {
    const res = await request(app)
      .get("/tasks?search=groceries")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
    expect(res.body.tasks[0].title.toLowerCase()).toContain("groceries");
  });

  test("GET /tasks — filter by status Pending", async () => {
    const res = await request(app)
      .get("/tasks?status=Pending")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    res.body.tasks.forEach((t) => expect(t.status).toBe("Pending"));
  });

  test("GET /tasks — filter by status Completed", async () => {
    const res = await request(app)
      .get("/tasks?status=Completed")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    res.body.tasks.forEach((t) => expect(t.status).toBe("Completed"));
  });

  test("GET /tasks — sort ascending returns oldest first", async () => {
    const res = await request(app)
      .get("/tasks?sort=asc&limit=10")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    const dates = res.body.tasks.map((t) => new Date(t.created_at).getTime());
    const sorted = [...dates].sort((a, b) => a - b);
    expect(dates).toEqual(sorted);
  });

  test("GET /tasks — sort descending returns newest first", async () => {
    const res = await request(app)
      .get("/tasks?sort=desc&limit=10")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    const dates = res.body.tasks.map((t) => new Date(t.created_at).getTime());
    const sorted = [...dates].sort((a, b) => b - a);
    expect(dates).toEqual(sorted);
  });

  test("GET /tasks — page 2 returns different results", async () => {
    const p1 = await request(app).get("/tasks?page=1&limit=3").set("Authorization", `Bearer ${token}`);
    const p2 = await request(app).get("/tasks?page=2&limit=3").set("Authorization", `Bearer ${token}`);
    const ids1 = p1.body.tasks.map((t) => t.id);
    const ids2 = p2.body.tasks.map((t) => t.id);
    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap.length).toBe(0);
  });

  // --- STATS ---
  test("GET /tasks/stats — returns correct counts", async () => {
    const res = await request(app)
      .get("/tasks/stats")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("pending");
    expect(res.body).toHaveProperty("inProgress");
    expect(res.body).toHaveProperty("completed");
    expect(res.body.total).toBe(res.body.pending + res.body.inProgress + res.body.completed);
  });

  // --- UPDATE ---
  test("PUT /tasks/:id — updates task status", async () => {
    const create = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To update", description: "Will change status", status: "Pending" });
    const id = create.body.id;

    const res = await request(app)
      .put(`/tasks/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Completed" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("Completed");
  });

  test("PUT /tasks/:id — returns 404 for non-existent task", async () => {
    const res = await request(app)
      .put("/tasks/99999")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Completed" });
    expect(res.statusCode).toBe(404);
  });

  // --- DELETE ---
  test("DELETE /tasks/:id — deletes a task", async () => {
    const create = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To delete", description: "Will be removed", status: "Pending" });
    const id = create.body.id;

    const res = await request(app)
      .delete(`/tasks/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test("DELETE /tasks/:id — returns 404 for non-existent task", async () => {
    const res = await request(app)
      .delete("/tasks/99999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});
