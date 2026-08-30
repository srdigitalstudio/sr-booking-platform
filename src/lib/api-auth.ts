import { getCurrentUser } from "@/lib/auth";

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return user;
}