require("dotenv").config();
const request = require("supertest");
const app     = require("../server");
const sequelize = require("../config/db");
const User    = require("../models/User");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Auth API", () => {
  const testUser = { name: "Test User", email: "test@o2h.com", password: "password123" };

  test("POST /auth/register — creates a new user and returns token", async () => {
    const res = await request(app).post("/auth/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testUser.email);
  });

  test("POST /auth/register — rejects duplicate email", async () => {
    const res = await request(app).post("/auth/register").send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  test("POST /auth/register — rejects missing fields", async () => {
    const res = await request(app).post("/auth/register").send({ email: "x@x.com" });
    expect(res.statusCode).toBe(400);
  });

  test("POST /auth/login — returns token with correct credentials", async () => {
    const res = await request(app).post("/auth/login").send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /auth/login — rejects wrong password", async () => {
    const res = await request(app).post("/auth/login").send({ email: testUser.email, password: "wrongpass" });
    expect(res.statusCode).toBe(401);
  });

  test("POST /auth/login — rejects unknown email", async () => {
    const res = await request(app).post("/auth/login").send({ email: "nobody@o2h.com", password: "123" });
    expect(res.statusCode).toBe(401);
  });

  test("GET /auth/me — returns user info with valid token", async () => {
    const loginRes = await request(app).post("/auth/login").send({ email: testUser.email, password: testUser.password });
    const token = loginRes.body.token;
    const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  test("GET /auth/me — rejects request without token", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.statusCode).toBe(401);
  });
});
