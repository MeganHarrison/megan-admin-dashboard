'use client';

import { useState, useEffect } from 'react';
import Badge from '@/components/ui/badge/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

interface Message {
  id: number;
  date_time: string;
  date: string;
  time: string;
  type: string;
  sender: string;
  message: string;
  attachment: string;
  tag: string;
  sentiment: string;
  category: string;
}

interface MessagesData {
  messages: Message[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function MessagesTable() {
  const [data, setData] = useState<MessagesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [useSampleData, setUseSampleData] = useState(true);

  const fetchMessages = async (page: number, search: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (search) {
        params.append('search', search);
      }
      
      if (useSampleData) {
        params.append('sample', 'true');
      }
      
      const response = await fetch(`/api/messages?${params}`);
      const result = await response.json() as any;
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch messages');
      }
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(currentPage, searchTerm);
  }, [currentPage, searchTerm, useSampleData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const getTypeColor = (type: string) => {
    return type.toLowerCase() === 'incoming' ? 'success' : 'primary';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'light';
      default: return 'light';
    }
  };

  const formatMessage = (message: string) => {
    if (message.length > 100) {
      return message.substring(0, 100) + '...';
    }
    return message;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Data Source Toggle */}
      <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Data Source:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!useSampleData}
            onChange={(e) => {
              setUseSampleData(!e.target.checked);
              setCurrentPage(1);
            }}
            className="rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Try Live Database (30,250 messages)
          </span>
        </label>
        {!useSampleData && (
          <span className="text-xs text-blue-700 dark:text-blue-300">
            May not work in local development
          </span>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search messages, sender, or type..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSearchInput('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
        )}
      </form>

      {/* Results Info */}
      {data && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {((data.pagination.currentPage - 1) * data.pagination.itemsPerPage) + 1} to {Math.min(data.pagination.currentPage * data.pagination.itemsPerPage, data.pagination.totalItems)} of {data.pagination.totalItems} messages
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>ID</TableCell>
                <TableCell isHeader>Date/Time</TableCell>
                <TableCell isHeader>Type</TableCell>
                <TableCell isHeader>Sender</TableCell>
                <TableCell isHeader>Message</TableCell>
                <TableCell isHeader>Attachment</TableCell>
                <TableCell isHeader>Sentiment</TableCell>
                <TableCell isHeader>Category</TableCell>
                <TableCell isHeader>Tag</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-mono text-sm">
                    {message.id}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium">{message.date}</div>
                    <div className="text-gray-500 text-xs">{message.time}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="light" color={getTypeColor(message.type)} size="sm">
                      {message.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {message.sender || <span className="text-gray-400 italic">Me</span>}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-sm" title={message.message}>
                      {formatMessage(message.message)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {message.attachment ? (
                      <span className="text-blue-600 dark:text-blue-400">📎 {message.attachment}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {message.sentiment ? (
                      <Badge variant="light" color={getSentimentColor(message.sentiment)} size="sm">
                        {message.sentiment}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {message.category || <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {message.tag || <span className="text-gray-400">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={!data.pagination.hasPrevPage}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === data.pagination.currentPage;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {data.pagination.totalPages > 5 && (
              <>
                <span className="px-2 py-2 text-sm text-gray-500">...</span>
                <button
                  onClick={() => setCurrentPage(data.pagination.totalPages)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    data.pagination.currentPage === data.pagination.totalPages
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  {data.pagination.totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.pagination.totalPages))}
            disabled={!data.pagination.hasNextPage}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}