const express = require("express");
const router = new express.Router();
const db = require("../db"); // Import database connection here

router.get("/", async (req, res, next) => {
    try {
        const result = await db.query("SELECT id, comp_code FROM invoices");
        return res.json({ invoices: result.rows });
    } catch (err) {
        return next(err);
    }
});

router.get("/:id", async (req,res,next) => {
    try {
        const { id } = req.params;
        const result = await db.query(`SELECT invoices.id, invoices.amt, invoices.paid,
             invoices.add_date, invoices.paid_date, companies.code, companies.name, 
             companies.description FROM invoices JOIN companies ON invoices.comp_code =
              companies.code WHERE invoices.id = $1`, [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Invoice not found "});
    }

    const invoice = result.rows[0];
    return res.json({
        invoice: {
            id: invoice.id,
            amt: invoice.amt,
            paid: invoice.paid,
            add_date: invoice.add_date,
            paid_date: invoice.paid_date,
            company: {
                code: invoice.code,
                name: invoice.name,
                description: invoice.description
            }
        }
    });

    } catch (err) {
        return next(err);
    }
});

router.post("/", async (req,res,next) => {
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES 
            ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
            [comp_code, amt]);
            return res.json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { amt } = req.body;
      const result = await db.query(
        "UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date",
        [amt, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Invoice not found" });
      }
  
      return res.json({ invoice: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await db.query("DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Invoice not found" });
      }
  
      return res.json({ status: "deleted" });
    } catch (err) {
      return next(err);
    }
  });

  