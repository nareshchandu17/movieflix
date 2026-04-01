import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface GenericPaginationProps {
  currentPage: number | string;
  baseUrl: string; // e.g., "/movie", "/series"
  maxPage?: number;
  visiblePages?: number;
  queryParams?: URLSearchParams; // Additional query parameters to preserve
}

const GenericPagination = ({
  currentPage,
  baseUrl,
  maxPage = 500,
  visiblePages = 5, // Reduced for cleaner mobile experience
  queryParams,
}: GenericPaginationProps) => {
  // Normalize current page to number
  const normalizedCurrentPage = isNaN(Number(currentPage))
    ? 1
    : Number(currentPage);

  // Ensure current page is within bounds
  const safePage = Math.max(1, Math.min(normalizedCurrentPage, maxPage));

  // Helper function to generate pagination URL with query parameters
  const getPaginationUrl = (pageNum: number): string => {
    const params = new URLSearchParams(queryParams);
    if (pageNum > 1) {
      params.set("page", pageNum.toString());
    } else {
      params.delete("page"); // Remove page=1 from URL for cleaner URLs
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Calculate previous and next page numbers
  const prevPage = Math.max(1, safePage - 1);
  const nextPage = Math.min(maxPage, safePage + 1);

  // Smart pagination logic for better UX
  const generatePageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const startPage = Math.max(2, safePage - Math.floor(visiblePages / 2));
    const endPage = Math.min(
      maxPage - 1,
      safePage + Math.floor(visiblePages / 2)
    );

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push("ellipsis");
    }

    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== maxPage) {
        pages.push(i);
      }
    }

    // Add ellipsis before last page if needed
    if (endPage < maxPage - 1) {
      pages.push("ellipsis");
    }

    // Always show last page (if different from first)
    if (maxPage > 1) {
      pages.push(maxPage);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col items-center space-y-4 py-8">
      <Pagination>
        <PaginationContent className="flex items-center gap-2">
          {/* Previous Button */}
          <PaginationItem>
            {safePage <= 1 ? (
              <PaginationPrevious
                className="pointer-events-none opacity-40 bg-gray-800 border-gray-700 hover:scale-100"
                aria-disabled="true"
              />
            ) : (
              <PaginationPrevious 
                href={getPaginationUrl(prevPage)}
                className="bg-gray-800 border-gray-700 hover:bg-blue-600 hover:border-blue-600 transition-all duration-200 hover:scale-105"
              />
            )}
          </PaginationItem>

          {/* Page Numbers */}
          {pageNumbers.map((pageNum, index) => (
            <PaginationItem key={index}>
              {pageNum === "ellipsis" ? (
                <PaginationEllipsis className="text-gray-400" />
              ) : (
                <PaginationLink
                  href={getPaginationUrl(pageNum)}
                  isActive={pageNum === safePage}
                  className={`min-w-[44px] h-11 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    pageNum === safePage
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600"
                  }`}
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next Button */}
          <PaginationItem>
            {safePage >= maxPage ? (
              <PaginationNext
                className="pointer-events-none opacity-40 bg-gray-800 border-gray-700 hover:scale-100"
                aria-disabled="true"
              />
            ) : (
              <PaginationNext 
                href={getPaginationUrl(nextPage)}
                className="bg-gray-800 border-gray-700 hover:bg-blue-600 hover:border-blue-600 transition-all duration-200 hover:scale-105"
              />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Simple Page Info */}
      <div className="text-gray-400 text-sm">
        Page {safePage} of {maxPage}
      </div>
    </div>
  );
};

export default GenericPagination;
