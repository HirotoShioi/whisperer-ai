import { fetchAuthSession } from "aws-amplify/auth";

export class Usage {
  readonly remaining: number;
  readonly total: number;
  readonly resetAt: number;

  constructor(remaining: number, total: number, resetAt: number) {
    this.remaining = remaining;
    this.total = total;
    this.resetAt = resetAt;
  }

  get isZero() {
    return this.remaining <= 0;
  }
}

export async function getUsage(): Promise<Usage> {
  const session = await fetchAuthSession();
  if (!session.tokens?.idToken) {
    return new Usage(0, 100, 0);
  }
  const response = await fetch(`${import.meta.env.VITE_API_URL}/usage`, {
    headers: {
      Authorization: `Bearer ${session.tokens.idToken.toString()}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch usage");
  }
  const data = (await response.json()) as {
    remaining: number;
    total: number;
    resetAt: number;
  };
  return new Usage(data.remaining, data.total, data.resetAt);
}
