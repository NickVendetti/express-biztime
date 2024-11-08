const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeAll(async () => {
  // Insert sample companies and invoices
  await db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')");
  await db.query("INSERT INTO invoices (comp_code, amt) VALUES ('apple', 100), ('apple', 200)");
});

afterAll(async () => {
  // Clean up after tests
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
});

describe("GET /invoices", () => {
  it("should return a list of invoices", async () => {
    const response = await request(app).get("/invoices");

    expect(response.status).toBe(200);
    expect(response.body.invoices).toBeDefined();
    expect(response.body.invoices.length).toBeGreaterThan(0);
  });
});

describe("GET /invoices/:id", () => {
  it("should return invoice details", async () => {
    const response = await request(app).get("/invoices/1");

    expect(response.status).toBe(200);
    expect(response.body.invoice).toBeDefined();
    expect(response.body.invoice.id).toBe(1);
  });

  it("should return a 404 if invoice not found", async () => {
    const response = await request(app).get("/invoices/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Invoice not found");
  });
});

describe("POST /invoices", () => {
  it("should create a new invoice", async () => {
    const response = await request(app)
      .post("/invoices")
      .send({ comp_code: "apple", amt: 500 });

    expect(response.status).toBe(200);
    expect(response.body.invoice).toBeDefined();
    expect(response.body.invoice.comp_code).toBe("apple");
  });
});

describe("PUT /invoices/:id", () => {
  it("should update an invoice", async () => {
    const response = await request(app)
      .put("/invoices/1")
      .send({ amt: 300 });

    expect(response.status).toBe(200);
    expect(response.body.invoice.amt).toBe(300);
  });

  it("should return 404 if invoice not found", async () => {
    const response = await request(app)
      .put("/invoices/999")
      .send({ amt: 500 });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Invoice not found");
  });
});

describe("DELETE /invoices/:id", () => {
  it("should delete an invoice", async () => {
    const response = await request(app).delete("/invoices/1");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("deleted");
  });

  it("should return 404 if invoice not found", async () => {
    const response = await request(app).delete("/invoices/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Invoice not found");
  });
});