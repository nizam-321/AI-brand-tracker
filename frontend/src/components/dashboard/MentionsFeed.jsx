// src/components/dashboard/MentionsFeed.jsx
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getSentimentColor, getSourceIcon, formatDate } from '@/lib/utils';
import { ThumbsUp, MessageCircle, Eye, ExternalLink, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MentionsFeed({ mentions, filterSentiment, filterPlatforms, filterTopics, loading }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 10 mentions per page

  // Filter mentions based on sentiment, platforms, and topics
  const filteredMentions = useMemo(() => {
    return mentions.filter(m => {
      const sentimentMatch = filterSentiment === 'all' || m.sentiment === filterSentiment;
      const platformMatch = filterPlatforms.length === 0 || filterPlatforms.includes(m.source);
      const topicMatch = filterTopics.length === 0 || filterTopics.includes(m.topic);
      return sentimentMatch && platformMatch && topicMatch;
    });
  }, [mentions, filterSentiment, filterPlatforms, filterTopics]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredMentions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMentions = filteredMentions.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSentiment, filterPlatforms, filterTopics]);

  // Loading state
  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Mentions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (filteredMentions.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Mentions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No mentions found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            Recent Mentions
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 font-medium">
              {filteredMentions.length}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredMentions.length)} of {filteredMentions.length}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mentions List */}
        <div className="space-y-4">
          {currentMentions.map((mention, index) => (
            <div
              key={mention._id}
              className="p-5 bg-linear-to-br from-white via-gray-50/30 to-gray-100/20 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{getSourceIcon(mention.source)}</span>
                  <Badge 
                    variant="outline" 
                    className={getSentimentColor(mention.sentiment)}
                  >
                    {mention.sentiment}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="bg-slate-50 text-slate-700 border-slate-200"
                  >
                    {mention.source}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    {mention.topic}
                  </Badge>
                  {mention.isSpike && (
                    <Badge 
                      variant="outline" 
                      className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(mention.timestamp)}
                </span>
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-3 leading-relaxed">
                {mention.text}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-gray-500">
                  <span className="font-medium text-gray-700">{mention.author}</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {mention.engagement?.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {mention.engagement?.comments || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {mention.reach || 0}
                  </span>
                </div>
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  <span className="text-xs">View Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {/* Page Info */}
            <p className="text-sm text-gray-600">
              Page <span className="font-medium text-gray-900">{currentPage}</span> of{' '}
              <span className="font-medium text-gray-900">{totalPages}</span>
            </p>

            {/* Pagination Controls */}
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </PaginationPrevious>
                </PaginationItem>

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  
                  // Show first page, last page, current page, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Show ellipsis
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}