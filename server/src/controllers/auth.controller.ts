import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { OAuth2Client } from 'google-auth-library';
import { Settings } from '../models';
import config from '../config/config';

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const generateToken = (user: User) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'customer',
      authProvider: 'local'
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user || user.authProvider !== 'local') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: config.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const { email, given_name, family_name, sub } = payload;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new user
      user = await User.create({
        email,
        firstName: given_name || 'Unknown',
        lastName: family_name || 'Unknown',
        role: 'customer',
        authProvider: 'google',
        authProviderId: sub
      });
    } else if (user.authProvider !== 'google') {
      return res.status(400).json({ message: 'Email already registered with different provider' });
    }

    const authToken = generateToken(user);

    res.json({
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during Google authentication', error });
  }
};

export const appleAuth = async (req: Request, res: Response) => {
  // Apple Sign In implementation would go here
  // This requires additional setup with Apple Developer account
  res.status(501).json({ message: 'Apple authentication not implemented yet' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.authProvider !== 'local') {
      // For security, don't reveal if user exists
      return res.json({ message: 'If an account exists, a reset link will be sent' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // This would use SendGrid or similar service

    res.json({ message: 'If an account exists, a reset link will be sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string };
    const user = await User.findByPk(decoded.id);

    if (!user || user.authProvider !== 'local') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password successfully reset' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
}; 