import express from 'express';
import { createLink, getLinks, getLinkStats, deleteLink } from './controllers.js';

export const router = express.Router();

router.post('/links', createLink);
router.get('/links', getLinks);
router.get('/links/:code', getLinkStats);
router.delete('/links/:code', deleteLink);
