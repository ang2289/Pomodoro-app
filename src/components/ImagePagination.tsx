import React from 'react'

interface ImagePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function ImagePagination({
  currentPage,
  totalPages,
  onPageChange,
}: ImagePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-40"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        上一頁
      </button>

      <span className="text-sm text-gray-600">
        第 {currentPage} / {totalPages} 頁
      </span>

      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-40"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        下一頁
      </button>
    </div>
  )
}
