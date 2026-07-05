import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import ReviewForm from "./ReviewForm";
import AppHeader from "@/components/AppHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await prisma.tenant.findUnique({
    where: { slug },
    select: { name: true, address: true },
  });
  if (!school) return {};
  return {
    title: `${school.name} | AcademiaDesk`,
    description: `View details, reviews and apply to ${school.name}`,
  };
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [school, session] = await Promise.all([
    prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        state: true,
        lga: true,
        phone: true,
        website: true,
        curriculum: true,
        feeRange: true,
        logo: true,
        schoolType: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        users: { select: { id: true } },
        _count: { select: { students: true, classes: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            parentName: true,
            rating: true,
            comment: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    }),
    auth(),
  ]);

  if (!school) notFound();
  // Hide unpublished schools from public, but let the owning admin see them
  const sessionUser = session?.user as ({ id?: string; } | undefined);
  const isOwner = sessionUser?.id
    ? school.users.some((u) => u.id === sessionUser.id)
    : false;

  if (!school.isPublished && !isOwner) notFound();

  const avgRating =
    school.reviews.length > 0
      ? school.reviews.reduce((sum, r) => sum + r.rating, 0) / school.reviews.length
      : null;

  const createdFormatted = new Date(school.createdAt).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedFormatted = new Date(school.updatedAt).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const wasUpdated = school.updatedAt.getTime() - school.createdAt.getTime() > 60_000;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Unpublished banner for owner */}
        {!school.isPublished && isOwner && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
            ⚠️ This school page is not yet published and is only visible to you.
          </div>
        )}

        {/* School header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-700 font-bold text-2xl">
                {school.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
                  {school.schoolType && (
                    <span className="mt-1 inline-block text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
                      {school.schoolType}
                    </span>
                  )}
                </div>

                {/* Admin sees edit, others see apply */}
                {isOwner ? (
                  <Link
                    href={`/schools/${slug}/edit`}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shrink-0"
                  >
                    Edit school details
                  </Link>
                ) : (
                  <Link
                    href={`/schools/${slug}/apply`}
                    className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 shrink-0"
                  >
                    Apply for admission
                  </Link>
                )}
              </div>

              {avgRating !== null && (
                <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                  <span>⭐ {avgRating.toFixed(1)}</span>
                  <span className="text-gray-400">
                    ({school.reviews.length} review{school.reviews.length !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">School details</h2>
            <div className="text-xs text-gray-400 text-right">
              <div>Listed {createdFormatted}</div>
              {wasUpdated && <div className="text-gray-500">Last updated {updatedFormatted}</div>}
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {school.address && (
              <div>
                <dt className="text-gray-500">Address</dt>
                <dd className="text-gray-900 font-medium mt-0.5">{school.address}</dd>
              </div>
            )}
            {school.state && (
              <div>
                <dt className="text-gray-500">State / LGA</dt>
                <dd className="text-gray-900 font-medium mt-0.5">
                  {school.state}{school.lga ? ` · ${school.lga}` : ""}
                </dd>
              </div>
            )}
            {school.phone && (
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900 font-medium mt-0.5">
                  <a href={`tel:${school.phone}`} className="hover:underline">
                    {school.phone}
                  </a>
                </dd>
              </div>
            )}
            {school.website && (
              <div>
                <dt className="text-gray-500">Website</dt>
                <dd className="text-gray-900 font-medium mt-0.5">
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {school.website.replace(/^https?:\/\//, "")}
                  </a>
                </dd>
              </div>
            )}
            {school.feeRange && (
              <div>
                <dt className="text-gray-500">Fee range</dt>
                <dd className="text-gray-900 font-medium mt-0.5">{school.feeRange}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Students enrolled</dt>
              <dd className="text-gray-900 font-medium mt-0.5">{school._count.students}</dd>
            </div>
          </dl>

          {school.curriculum.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Curriculum</p>
              <div className="flex flex-wrap gap-2">
                {school.curriculum.map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-blue-50 text-blue-700 rounded-full px-3 py-1 font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews — only show for public/non-owner */}
        {!isOwner && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Reviews{school.reviews.length > 0 && ` (${school.reviews.length})`}
            </h2>

            {school.reviews.length > 0 ? (
              <div className="space-y-4 mb-6">
                {school.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {review.parentName}
                        </span>
                        {review.isVerified && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={i < review.rating ? "text-yellow-400" : "text-gray-200"}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-6">
                No reviews yet. Be the first to leave one.
              </p>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Leave a review</h3>
              <ReviewForm slug={slug} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
