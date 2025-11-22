import { pool } from './db.js';
import { customAlphabet } from 'nanoid';
import asyncHandler from './utils/asyncHandler.js';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6);

// Helper to validate custom code
const isValidCode = (code) => code && code.length > 0 && !code.includes('/');

export const createLink = asyncHandler(async (req, res) => {
    const { url, shortCode } = req.body;

    if (!url) {
        res.status(400);
        throw new Error('URL is required');
    }

    try {
        new URL(url);
    } catch (err) {
        res.status(400);
        throw new Error('Invalid URL format');
    }

    let code = shortCode;

    if (code) {
        if (!isValidCode(code)) {
            res.status(400);
            throw new Error('Invalid short code. Cannot contain "/".');
        }
        // Check if exists
        const check = await pool.query('SELECT short_code FROM links WHERE short_code = $1', [code]);
        if (check.rows.length > 0) {
            res.status(409);
            throw new Error('Short code already exists');
        }
    } else {
        // Check if URL already exists
        const existing = await pool.query('SELECT short_code FROM links WHERE original_url = $1', [url]);
        if (existing.rows.length > 0) {
            res.status(409);
            throw new Error(`URL already shortened to /${existing.rows[0].short_code}`);
        }

        // Generate unique code
        let unique = false;
        while (!unique) {
            code = nanoid();
            const check = await pool.query('SELECT short_code FROM links WHERE short_code = $1', [code]);
            if (check.rows.length === 0) {
                unique = true;
            }
        }
    }

    await pool.query(
        'INSERT INTO links (short_code, original_url) VALUES ($1, $2)',
        [code, url]
    );
    res.status(201).json({ shortCode: code, url });
});

export const getLinks = asyncHandler(async (req, res) => {
    const result = await pool.query('SELECT * FROM links ORDER BY created_at DESC');
    res.json(result.rows);
});

export const getLinkStats = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const result = await pool.query('SELECT * FROM links WHERE short_code = $1', [code]);
    if (result.rows.length === 0) {
        res.status(404);
        throw new Error('Link not found');
    }
    res.json(result.rows[0]);
});

export const deleteLink = asyncHandler(async (req, res) => {
    const { code } = req.params;
    await pool.query('DELETE FROM links WHERE short_code = $1', [code]);
    res.status(204).send(); // No content
});

export const handleRedirect = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const result = await pool.query('SELECT original_url FROM links WHERE short_code = $1', [code]);
    if (result.rows.length === 0) {
        res.status(404).send('Not Found');
        return;
    }

    const originalUrl = result.rows[0].original_url;

    // Update stats asynchronously - we don't await this to speed up redirect
    pool.query(
        'UPDATE links SET click_count = click_count + 1, last_clicked_at = NOW() WHERE short_code = $1',
        [code]
    ).catch(err => console.error('Error updating stats:', err));

    res.redirect(originalUrl);
});
