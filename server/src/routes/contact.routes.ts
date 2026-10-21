import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { getDatabase } from '../db/database.js';
import { RedactionService } from '../services/redaction.service.js';

const router = Router();

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().email('Please provide a valid email address.').max(150),
  subject: z.string().min(4, 'Subject must be at least 4 characters.').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters.').max(5000)
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parse = ContactSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: parse.error.issues[0]?.message || 'Invalid input provided.',
        details: parse.error.issues
      });
      return;
    }

    const { name, email, subject, message } = parse.data;
    const cleanMessage = RedactionService.redact(message).redactedText;
    const cleanSubject = RedactionService.redact(subject).redactedText;
    const id = 'inq_' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();

    const db = getDatabase();
    db.prepare(`
      INSERT INTO inquiries (id, name, email, subject, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name.trim(), email.trim().toLowerCase(), cleanSubject, cleanMessage, now);

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been received by Zelqora Engineering. We will review your message promptly.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
