import { Request, Response } from "express";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { hashPassword, comparePassword } from "@/utils/password";
import { signToken } from "@/utils/jwt";
import { generateResetToken, hashResetToken } from "@/utils/resetToken";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/utils/validators/auth.validator";

function sanitizeUser<T extends { passwordHash: string }>(user: T) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = signupSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const token = signToken({ sub: user.id, role: user.role });
  res.status(201).json({ token, user: sanitizeUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }
  if (user.status === "INACTIVE") {
    throw new AppError(403, "This account has been deactivated — contact your admin");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signToken({ sub: user.id, role: user.role });
  res.json({ token, user: sanitizeUser(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user || user.status === "INACTIVE") {
    throw new AppError(401, "Session is no longer valid");
  }
  res.json({ user: sanitizeUser(user) });
});

// No SMTP is configured for this hackathon build, so there's nowhere to actually
// deliver the email. The link is logged server-side and echoed back in the response
// (devResetLink) so the flow is demoable without real email infra. Wire a mailer and
// drop the devResetLink field before this ever sees production.
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });

  let devResetLink: string | undefined;
  if (user && user.status === "ACTIVE") {
    const { token, tokenHash, expiresAt } = generateResetToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt },
    });

    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    devResetLink = `${clientOrigin}/reset-password?token=${token}`;
    console.log(`[dev] Password reset link for ${email}: ${devResetLink}`);
  }

  res.json({
    message: "If an account exists for that email, a reset link has been sent.",
    ...(devResetLink && { devResetLink }),
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = resetPasswordSchema.parse(req.body);
  const tokenHash = hashResetToken(token);

  const user = await prisma.user.findFirst({
    where: { resetTokenHash: tokenHash, resetTokenExpiresAt: { gt: new Date() } },
  });
  if (!user) {
    throw new AppError(400, "Invalid or expired reset link");
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
  });

  res.json({ message: "Password reset — you can now log in with your new password." });
});
