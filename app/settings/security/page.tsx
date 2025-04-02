import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TwoFactorSettings from "@/app/components/TwoFactorSettings";

export default async function SecuritySettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      twoFactorEnabled: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Настройки безопасности</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <TwoFactorSettings 
          initialEnabled={user?.twoFactorEnabled ?? false} 
        />
      </div>
    </div>
  );
} 