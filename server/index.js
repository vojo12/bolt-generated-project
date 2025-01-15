import express from 'express';
    import cors from 'cors';
    import sqlite3 from 'sqlite3';
    import { open } from 'sqlite';
    import bcrypt from 'bcryptjs';
    import jwt from 'jsonwebtoken';
    import dotenv from 'dotenv';

    dotenv.config();
    const app = express();
    app.use(cors());
    app.use(express.json());

    let db;
    async function initializeDb() {
      db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
      });

      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          subdomain TEXT UNIQUE
        );
        
        CREATE TABLE IF NOT EXISTS questionnaires (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          data TEXT NOT NULL,
          published BOOLEAN DEFAULT 0,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `);
    }

    initializeDb();

    // Authentication middleware
    const authenticate = (req, res, next) => {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).send('Access denied');

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
      } catch (err) {
        res.status(400).send('Invalid token');
      }
    };

    // User registration
    app.post('/api/register', async (req, res) => {
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 8);
      
      try {
        const { lastID } = await db.run(
          'INSERT INTO users (email, password) VALUES (?, ?)',
          [email, hashedPassword]
        );
        res.status(201).send({ id: lastID, email });
      } catch (err) {
        res.status(400).send('Registration failed');
      }
    });

    // User login
    app.post('/api/login', async (req, res) => {
      const { email, password } = req.body;
      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send('Invalid credentials');
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.send({ token });
    });

    // Questionnaire CRUD routes
    app.post('/api/questionnaires', authenticate, async (req, res) => {
      const { title, data } = req.body;
      const { id: userId } = req.user;
      
      const { lastID } = await db.run(
        'INSERT INTO questionnaires (user_id, title, data) VALUES (?, ?, ?)',
        [userId, title, JSON.stringify(data)]
      );
      res.status(201).send({ id: lastID });
    });

    app.listen(3001, () => console.log('Server running on port 3001'));
