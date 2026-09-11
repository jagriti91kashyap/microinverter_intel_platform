'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  Share2,
  Heart,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

interface AdvancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  onRowClick?: (item: T) => void;
  onExport?: (data: T[]) => void;
  onShare?: (data: T[]) => void;
}

type SortDirection = 'asc' | 'desc' | null;
type SortConfig = { key: string; direction: SortDirection };

export function AdvancedDataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  filterable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  loading = false,
  onRowClick,
  onExport,
  onShare
}: AdvancedDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set());

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        columns.some(column => {
          const value = item[column.key];
          return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, sortConfig, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key: keyof T) => {
    setSortConfig(prev => {
      const keyStr = String(key);
      if (prev.key === keyStr) {
        return {
          key: keyStr,
          direction: prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        };
      }
      return { key: keyStr, direction: 'asc' };
    });
  };

  const toggleRowSelection = (id: string | number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleFavorite = (id: string | number) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable || sortConfig.key !== column.key) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="w-4 h-4 text-primary" />;
    }
    if (sortConfig.direction === 'desc') {
      return <ArrowDown className="w-4 h-4 text-primary" />;
    }
    return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {searchable && (
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white max-w-sm flex-1 focus-within:ring-2 focus-within:ring-enphase-500">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <Badge className="bg-accent text-accent-foreground">
              {selectedRows.size} selected
            </Badge>
          )}
          
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(selectedRows.size > 0 ? data.filter(item => selectedRows.has(item.id)) : data)}
              className="glass-card border-border/50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(selectedRows.size > 0 ? data.filter(item => selectedRows.has(item.id)) : data)}
              className="glass-card border-border/50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card border-border/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(paginatedData.map(item => item.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    className="rounded border-border"
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key as string}
                    className={`p-4 text-left font-medium text-muted-foreground ${
                      column.sortable ? 'cursor-pointer hover:text-foreground' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => sortable && column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {sortable && column.sortable && getSortIcon(column)}
                    </div>
                  </th>
                ))}
                <th className="w-16 p-4 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: pageSize }).map((_, index) => (
                    <motion.tr
                      key={`skeleton-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border/10"
                    >
                      <td className="p-4">
                        <div className="w-4 h-4 bg-muted rounded loading-shimmer" />
                      </td>
                      {columns.map((column) => (
                        <td key={column.key as string} className="p-4">
                          <div className="w-full h-4 bg-muted rounded loading-shimmer" />
                        </td>
                      ))}
                      <td className="p-4">
                        <div className="w-8 h-8 bg-muted rounded loading-shimmer" />
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  paginatedData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-border/10 hover:bg-muted/30 transition-colors cursor-pointer ${
                        selectedRows.has(item.id) ? 'bg-muted/20' : ''
                      }`}
                      onClick={() => onRowClick?.(item)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(item.id)}
                          onChange={() => toggleRowSelection(item.id)}
                          className="rounded border-border"
                        />
                      </td>
                      {columns.map((column) => (
                        <td key={column.key as string} className="p-4">
                          {column.render ? (
                            column.render(item[column.key], item)
                          ) : (
                            <span className="text-sm">{item[column.key]}</span>
                          )}
                        </td>
                      ))}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className="p-1 rounded hover:bg-muted/50 transition-colors"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                favorites.has(item.id)
                                  ? 'fill-accent text-accent'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md p-1 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                                <MoreHorizontal className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-card border-border/20" align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open in New Tab
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download Data
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, processedData.length)} of {processedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="glass-card border-border/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 ${
                      currentPage === pageNumber
                        ? 'vercel-gradient text-white border-transparent'
                        : 'glass-card border-border/50'
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="glass-card border-border/50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
