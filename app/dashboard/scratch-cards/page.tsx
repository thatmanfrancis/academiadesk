import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserPrivileges } from "@/lib/privileges";
import prisma from "@/lib/prisma";
import ScratchCardManager from "./ScratchCardManager";

export default async function ScratchCardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const privileges = await getUserPrivileges(session.user.id);
  if (!privileges?.canPublishResults) redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tenantId: true },
  });
  if (!user?.tenantId) redirect("/dashboard");

  const [cards, stats] = await Promise.all([
    prisma.scratchCard.findMany({
      where: { tenantId: user.tenantId },
      include: {
        student: { select: { firstName: true, lastName: true, regNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.scratchCard.groupBy({
      by: ["status"],
      where: { tenantId: user.tenantId },
      _count: true,
    }),
  ]);

  const unused = stats.find((s) => s.status === "UNUSED")?._count ?? 0;
  const used = stats.find((s) => s.status === "USED")?._count ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Scratch Cards</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{unused}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unused</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{used}</p>
          <p className="text-xs text-gray-500 mt-0.5">Used</p>
        </div>
      </div>

      <ScratchCardManager cards={cards} />
    </div>
  );
}
