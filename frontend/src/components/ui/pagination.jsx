import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className,
  ...props
}) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Function to handle page click
  const handlePageClick = (page) => {
    if (page === currentPage) return;
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };
  
  // Generate pagination items
  const generatePaginationItems = () => {
    // Always show first page, last page, current page, and one page before and after current
    const items = [];
    
    // Previous button
    items.push(
      <Button
        key="prev"
        variant="outline"
        size="icon"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );
    
    // First page
    items.push(
      <Button
        key="1"
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handlePageClick(1)}
        className="h-8 w-8"
      >
        1
      </Button>
    );
    
    // Ellipsis after first page if needed
    if (currentPage > 3) {
      items.push(
        <Button key="ellipsis1" variant="outline" size="sm" disabled className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    }
    
    // Pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      // Skip if this would create duplicate with first or last page
      if (i === 1 || i === totalPages) continue;
      
      items.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(i)}
          className="h-8 w-8"
        >
          {i}
        </Button>
      );
    }
    
    // Ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <Button key="ellipsis2" variant="outline" size="sm" disabled className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    }
    
    // Last page (if more than one page)
    if (totalPages > 1) {
      items.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(totalPages)}
          className="h-8 w-8"
        >
          {totalPages}
        </Button>
      );
    }
    
    // Next button
    items.push(
      <Button
        key="next"
        variant="outline"
        size="icon"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );
    
    return items;
  };
  
  return (
    <div className={`flex items-center gap-1 ${className}`} {...props}>
      {generatePaginationItems()}
    </div>
  );
}

export default Pagination; 