import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.middleware.js';
import { ENV } from '../config/env.js';

const router = Router();

const AuthSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.')
});

const cookieOptions = {
  httpOnly: true,
  secure: ENV.COOKIE_SECURE,
  sameSite: 'lax' as const,
  maxAge: ENV.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  path: '/'
};

router.post('/register', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parse = AuthSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.issues });
      return;
    }

    const { user, token } = await AuthService.register(parse.data.email, parse.data.password);

    // If guest token was present, automatically claim any anonymous investigations
    let claimedCount = 0;
    if (req.guestToken) {
      claimedCount = await AuthService.claimGuestInvestigations(req.guestToken, user.id);
    }

    res.cookie('zelqora_session', token, cookieOptions);
    res.status(201).json({
      user,
      token,
      claimed_investigations: claimedCount
    });
  } catch (err: any) {
    res.status(400).json({ error: 'Registration Failed', message: err.message });
  }
});

router.post('/login', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parse = AuthSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.issues });
      return;
    }

    const { user, token } = await AuthService.login(parse.data.email, parse.data.password);

    // If guest token was present, claim any anonymous investigations
    let claimedCount = 0;
    if (req.guestToken) {
      claimedCount = await AuthService.claimGuestInvestigations(req.guestToken, user.id);
    }

    res.cookie('zelqora_session', token, cookieOptions);
    res.json({
      user,
      token,
      claimed_investigations: claimedCount
    });
  } catch (err: any) {
    res.status(401).json({ error: 'Authentication Failed', message: err.message });
  }
});

router.post('/logout', async (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies?.zelqora_session || 
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (token) {
    await AuthService.logout(token);
  }

  res.clearCookie('zelqora_session', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user || null,
    guest_token: req.guestToken || null
  });
});

router.post('/claim', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const guestToken = req.body?.guest_token || req.guestToken;
  if (!guestToken) {
    res.status(400).json({ error: 'Missing guest token to claim.' });
    return;
  }

  const claimed = await AuthService.claimGuestInvestigations(guestToken, req.user!.id);
  res.json({ success: true, claimed_investigations: claimed });
});

export default router;
