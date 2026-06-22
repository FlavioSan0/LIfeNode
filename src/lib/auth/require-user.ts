import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  profile: {
    timezone: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
};

export async function requireUser(): Promise<CurrentUser> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true
    }
  });

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      email: user.email,
      name: user.name,
      avatarUrl: user.image
    },
    create: {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.image
    },
    select: {
      timezone: true,
      email: true,
      name: true,
      avatarUrl: true
    }
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    profile
  };
}
