const express = require("express");
const router = new express.Router();
const slugify = require('slugify');
const db = require("../db"); // Import database connection

// GET /companies
router.get("/", async (req, res, next) => {
    try {
        const result = await db.query("SELECT code, name FROM companies");
        return res.json({ companies: result.rows });
    } catch (err) {
        return next(err);
    }
});

// GET /companies/:code
router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const companyResult = await db.query(
            "SELECT code, name, description FROM companies WHERE code = $1",
            [code]
        );

        if (companyResult.rows.length === 0) {
            return res.status(404).json({ error: "Company not found" });
        }

        // Fetch industries for the company
        const industriesResult = await db.query(
        "SELECT industries.code, industries.industry FROM industries JOIN company_industries ON industries.code = company_industries.industry_code WHERE company_industries.company_code = $1",
        [code]
        );

        const company = companyResult.rows[0];
        company.invoices = invoicesResult.rows.map(inv => inv.id);

        return res.json({ company });
    } catch (err) {
        return next(err);
    }
});

// POST /companies (creates a company)
router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required." });
        }

        // Automatically generate a slugified company code
        const code = slugify(name, { lower: true });

        const result = await db.query(
            "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
            [code, name, description]
        );
        return res.json({ company: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

// PUT /companies/:code (updates a company)
router.put("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required." });
        }

        const result = await db.query(
            "UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description",
            [name, description, code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Company not found" });
        }

        return res.json({ company: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

// DELETE /companies/:code (deletes a company)
router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const result = await db.query(
            "DELETE FROM companies WHERE code = $1 RETURNING code", [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Company not found" });
        }

        return res.json({ status: "deleted" });
    } catch (err) {
        return next(err);
    }
});

// routes/companies.js
router.post("/:code/industries", async (req, res, next) => {
    try {
      const { code } = req.params;
      const { industry_code } = req.body;
  
      // Check if the industry exists
      const industryResult = await db.query(
        "SELECT code FROM industries WHERE code = $1",
        [industry_code]
      );
  
      if (industryResult.rows.length === 0) {
        return res.status(404).json({ error: "Industry not found" });
      }
  
      // Add the industry to the company
      await db.query(
        "INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2)",
        [code, industry_code]
      );
  
      return res.status(201).json({ message: "Industry associated with company" });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;