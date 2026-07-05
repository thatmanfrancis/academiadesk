import Link from "next/link";
import prisma from "@/lib/prisma";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function SchoolList({ searchParams }: Props) {
  const params = await searchParams;

  const q = params.q ?? "";
  const state = params.state ?? "";
  const curriculum = params.curriculum ?? "";
  const schoolType = params.schoolType ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    isPublished: true,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { address: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(state && { state: { equals: state, mode: "insensitive" as const } }),
    ...(curriculum && { curriculum: { has: curriculum } }),
    ...(schoolType && {
      schoolType: { equals: schoolType, mode: "insensitive" as const },
    }),
  };

  const [schools, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        state: true,
        lga: true,
        curriculum: true,
        feeRange: true,
        logo: true,
        schoolType: true,
        _count: { select: { reviews: true } },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  if (schools.length === 0) {
    return (
      <div className="mt-8 text-center py-16 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">No schools found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-500 mb-4">
        Showing {skip + 1}–{Math.min(skip + limit, total)} of {total} school{total !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools.map((school) => {
          const avgRating =
            school.reviews.length > 0
              ? school.reviews.reduce((sum, r) => sum + r.rating, 0) / school.reviews.length
              : null;

          return (
            <Link
              key={school.id}
              href={`/schools/${school.slug}`}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all block"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-sm">
                    {school.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {school.schoolType && (
                  <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                    {school.schoolType}
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                {school.name}
              </h3>

              {school.address && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                  {school.address}
                  {school.state ? `, ${school.state}` : ""}
                </p>
              )}

              {school.curriculum.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {school.curriculum.slice(0, 2).map((c) => (
                    <span
                      key={c}
                      className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5"
                    >
                      {c}
                    </span>
                  ))}
                  {school.curriculum.length > 2 && (
                    <span className="text-xs text-gray-400">+{school.curriculum.length - 2}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {avgRating !== null ? (
                    <>⭐ {avgRating.toFixed(1)} ({school._count.reviews})</>
                  ) : (
                    "No reviews yet"
                  )}
                </span>
                {school.feeRange && <span>{school.feeRange}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const sp = new URLSearchParams(params);
            sp.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/schools?${sp.toString()}`}
                className={`h-8 w-8 flex items-center justify-center rounded-md text-sm border transition-colors ${
                  p === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
