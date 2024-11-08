const db = require('../db');

class Company {
    static async all() {
        const result = await db.query('SELECT code, name FROM companies');
        return result.rows;
    }

    static async get(code) {
        const result = await db.query(
            'SELECT code, name, description FROM companies WHERE code = $1',
            [code]
        );
        const company = result.rows[0];
        if (!company) {
            throw new Error(`Company with code ${code} not found`);
        }  
        return company;
      }

      static async create(data) {
        const result = await db.query(
            'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
            [data.code, data.name, data.description]
        );
        return result.rows[0];
      }

      static async update(code, data) {
        const result = await db.query(
            'UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description',
            [data.name, data.description, code]
        );
        const company = result.rows[0];
        if (!company) {
            throw new Error(`Company with code ${code} not found`);
        }
        return company;
      }

      static async remove(code) {
        const result = await db.query('DELETE FROM companies WHERE code = $1 RETURNING code',
            [code]
        );
        const company = result.rows[0];
        if (!company) {
            throw new Error(`Company with code ${code} not found`);
        }
        return company;
      }
}

module.exports = Company;