import crypto from "crypto";

export const hashToken = (token: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  return hashedToken;
};

export const generateTokens = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = hashToken(rawToken);

  return { rawToken, hashedToken };
};
