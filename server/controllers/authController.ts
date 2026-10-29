import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { AuthenticatedRequest, JWT_SECRET } from '../middleware/auth';
import { UserRecord, UserRole, VerifiedStatus } from '../types';

export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, role, name, organizationDetails } = req.body;

    if (!email || !password || !role || !name) {
      res.status(400).json({ error: 'Missing required fields: email, password, role, and name are required.' });
      return;
    }

    const validRoles: UserRole[] = ['DONOR', 'RECIPIENT', 'ADMIN'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role specified. Must be DONOR, RECIPIENT, or ADMIN.' });
      return;
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = `user-${Date.now()}`;

    // Admin accounts or pre-authorized demo orgs are verified immediately; regular new organizations require admin approval
    const verifiedStatus: VerifiedStatus = role === 'ADMIN' ? 'VERIFIED' : 'PENDING';

    const newUser: UserRecord = {
      id,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      name: name.trim(),
      organizationDetails: organizationDetails || {},
      verifiedStatus,
      createdAt: new Date().toISOString()
    };

    await db.createUser(newUser);

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: safeUser
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      message: 'Authentication successful.',
      token,
      user: safeUser
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const user = await db.findUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
}
