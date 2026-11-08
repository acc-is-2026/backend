export interface JwtPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {};
