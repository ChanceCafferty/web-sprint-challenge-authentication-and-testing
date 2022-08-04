// Write your tests here
const db = require("../data/dbConfig");
const server = require("./server");
const request = require("supertest");


test("sanity", () => {
  expect(true).toBe(true);
});

afterAll(async () => {
  await db.destroy();
});
beforeEach(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

describe("/auth/register", () => {
  describe("required fields are required", () => {
    test("fails with missing passowrd", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send({ username: "User " }); // a request with no password

      expect(res.status).toBe(400);
      expect(res.text).toBe("username and password required");
    });
    test("fails with missing username", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send({ password: "password" }); // a request with no username

      expect(res.status).toBe(400);
      expect(res.text).toBe("username and password required");
    });
  });
});

describe("/auth/login", () => {
  // register a new user
  beforeEach(async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "User", password: "password" });
  });

  test("fails with an incorrect password", async () => {
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "User", password: "wrong_password" });

    expect(res.status).toBe(400);
    expect(res.text).toBe("invalid credentials");
  });
  test("with a valid user, a token is returned", async () => {
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "User", password: "password" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });
});

describe("/jokes", () => {
  // register a new user
  beforeEach(async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "User", password: "password" });
  });

  test("fails with an invalid token", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const res = await request(server)
      .get("/api/jokes")
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.text).toBe("token invalid");
  });
  test("returns jokes with a valid token", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "User", password: "password" });
    const loginRes = await request(server)
      .post("/api/auth/login")
      .send({ username: "User", password: "password" });
    const { token } = loginRes.body;
    const res = await request(server)
      .get("/api/jokes")
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
  });
});