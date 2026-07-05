import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserPrivileges } from "@/lib/privileges";
import { randomBytes } from "crypto";

function generatePin() {
  return randomBytes(6).toString("hex").toUpperCase(); // 12-char PIN
}

function generateSerial(prefix: string) {
  return `${prefix}-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const privileges = await getUserPrivileges(session.user.id);
  if (!privileges?.canPublishResults) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tenantId: true },
  });
  if (!user?.tenantId) return NextResponse.json({ error: "No school" }, { status: 400 });

  const { count = 1, studentId } = await req.json();

  if (typeof count !== "number" || count < 1 || count > 100) {
    return NextResponse.json({ error: "Count must be 1–100" }, { status: 400 });
  }

  const cards = await prisma.$transaction(
    Array.from({ length: count }).map(() =>
      prisma.scratchCard.create({
        data: {
          tenantId: user.tenantId!,
          studentId: studentId ?? null,
          pin: generatePin(),
          serial: generateSerial("ACD"),
        },
      })
    )
  );

  return NextResponse.json(cards, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const privileges = await getUserPrivileges(session.user.id);
  if (!privileges?.canPublishResults) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tenantId: true },
  });
  if (!user?.tenantId) return NextResponse.json({ error: "No school" }, { status: 400 });

  const cards = await prisma.scratchCard.findMany({
    where: { tenantId: user.tenantId },
    include: { student: { select: { firstName: true, lastName: true, regNumber: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(cards);
}
