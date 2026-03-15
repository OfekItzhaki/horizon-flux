import { useState, useEffect, useMemo } from 'react';

export interface PaginationResult<T> {
  page: T[];
  currentPage: number;
  totalPages: number;
  goToPage: (n: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function usePagination<T>(items: T[], pageSize: number = 25): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the items reference changes (search/sort upstream)
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize]
  );

  const page = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const goToPage = (n: number) => {
    const clamped = Math.max(1, Math.min(n, totalPages));
    setCurrentPage(clamped);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    page,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
