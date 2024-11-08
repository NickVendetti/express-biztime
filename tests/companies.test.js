const request = require("supertest");
const app = require("../app");  // Import your Express app
const db = require("../db");    // Import your database connection

beforeAll(async () => {
  // Set up any pre-test data in the database if needed.
});

afterAll(async () => {
  // Clean up database after tests if needed.
  await db.query("DELETE FROM companies");
});

describe("GET /companies", () => {
  it("should return a list of companies", async () => {
    const response = await request(app).get("/companies");

    expect(response.status).toBe(200);
    expect(response.body.companies).toBeDefined();
    expect(response.body.companies.length).toBeGreaterThan(0);
  });
});

describe("GET /companies/:code", () => {
  it("should return a single company by code", async () => {
    const response = await request(app).get("/companies/apple");

    expect(response.status).toBe(200);
    expect(response.body.company).toBeDefined();
    expect(response.body.company.code).toBe("apple");
  });

  it("should return a 404 if company is not found", async () => {
    const response = await request(app).get("/companies/nonexistent");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Company not found");
  });
});

describe("POST /companies", () => {
  it("should create a new company", async () => {
    const response = await request(app)
      .post("/companies")
      .send({ code: "newcode", name: "New Company", description: "A new company" });

    expect(response.status).toBe(200);
    expect(response.body.company).toBeDefined();
    expect(response.body.company.code).toBe("newcode");
  });
});

describe("PUT /companies/:code", () => {
  it("should update an existing company", async () => {
    const response = await request(app)
      .put("/companies/apple")
      .send({ name: "Updated Apple", description: "Updated description" });

    expect(response.status).toBe(200);
    expect(response.body.company.name).toBe("Updated Apple");
  });

  it("should return 404 if company not found", async () => {
    const response = await request(app)
      .put("/companies/nonexistent")
      .send({ name: "Non-existent Company" });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Company not found");
  });
});

describe("DELETE /companies/:code", () => {
  it("should delete a company", async () => {
    const response = await request(app).delete("/companies/apple");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("deleted");
  });

  it("should return 404 if company not found", async () => {
    const response = await request(app).delete("/companies/nonexistent");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Company not found");
  });
});