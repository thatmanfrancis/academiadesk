import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { serial, pin } = await req.json();

  if (!serial || !pin) {
    return NextResponse.json({ error: "Serial and PIN required" }, { status: 400 });
  }

  const card = await prisma.scratchCard.findUnique({
    where: { serial },
    include: {
      student: {
        include: {
          class: { select: { name: true } },
          grades: {
            include: { term: { select: { name: true } } },
            orderBy: [{ term: { year: "desc" } }, { subject: "asc" }],
          },
        },
      },
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Invalid serial number" }, { status: 404 });
  }

  if (card.pin !== pin) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  if (card.status === "USED") {
    return NextResponse.json({ error: "This scratch card has already been used" }, { status: 409 });
  }

  if (!card.student) {
    return NextResponse.json({ error: "No student linked to this card" }, { status: 400 });
  }

  // Mark card as used
  await prisma.scratchCard.update({
    where: { id: card.id },
    data: { status: "USED", usedAt: new Date() },
  });

  return NextResponse.json({
    student: {
      name: `${card.student.lastName} ${card.student.firstName}`,
      regNumber: card.student.regNumber,
      class: card.student.class.name,
    },
    grades: card.student.grades,
  });
}
