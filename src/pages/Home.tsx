import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDemoQuestions } from '../contexts/DemoQuestionsContext';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Tag, Clock, User, X, TrendingUp } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  user_id: string;
  created_at: string;
  answer_count: number;
  vote_count: number;
  users?: {
    username: string;
  };
}

export default function Home() {
  const { demoQuestions } = useDemoQuestions();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'unanswered' | 'popular' | 'trending'>('newest');
  const [selectedFilterTag, setSelectedFilterTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreQuestions, setHasMoreQuestions] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const questionsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
    setQuestions([]);
    setHasMoreQuestions(true);
    fetchQuestions();
  }, [sortBy, searchQuery, selectedFilterTag, demoQuestions]);

  const fetchQuestions = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    // Try to fetch from database first
    if (supabase) {
      try {
        let query = supabase
          .from('questions')
          .select(`
            *,
            profiles (username, avatar_url)
          `)
          .range((page - 1) * questionsPerPage, page * questionsPerPage - 1);

        // Apply tag filter
        if (selectedFilterTag) {
          // For now, skip tag filtering for database questions since tags structure may differ
          // query = query.contains('tags', [selectedFilterTag]);
        }

        // Apply search filter
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        // Apply sorting
        switch (sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'unanswered':
            query = query.eq('answer_count', 0).order('created_at', { ascending: false });
            break;
          case 'trending':
            query = query.order('updated_at', { ascending: false }).order('vote_score', { ascending: false });
            break;
          case 'popular':
            query = query.order('vote_score', { ascending: false }).order('answer_count', { ascending: false });
            break;
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // Transform database data to match frontend interface
        const transformedData = (data || []).map(item => ({
          ...item,
          vote_count: item.vote_score || 0,
          users: item.profiles || { username: 'Unknown' },
          tags: Array.isArray(item.tags) ? item.tags : []
        }));
        
        // Combine database questions with demo questions
        let allQuestions = [...transformedData, ...demoQuestions];
        
        // Remove duplicates (prefer database version)
        const uniqueQuestions = allQuestions.reduce((acc, current) => {
          const existing = acc.find(q => q.id === current.id);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, [] as Question[]);
        
        if (append) {
          setQuestions(prev => [...prev, ...uniqueQuestions]);
        } else {
          setQuestions(uniqueQuestions);
        }
        
        setHasMoreQuestions(uniqueQuestions.length === questionsPerPage);
      } catch (error) {
        console.log('Database error (tables may not exist). Using demo questions.', error);
        
        // Fallback to demo questions only
        let filteredQuestions = [...demoQuestions];
        
        // Apply tag filter to demo questions
        if (selectedFilterTag) {
          filteredQuestions = filteredQuestions.filter(q => 
            q.tags.includes(selectedFilterTag)
          );
        }
        
        // Apply search filter to demo questions
        if (searchQuery) {
          filteredQuestions = filteredQuestions.filter(q => 
            q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        // Apply sorting to demo questions
        switch (sortBy) {
          case 'newest':
            filteredQuestions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            break;
          case 'unanswered':
            filteredQuestions = filteredQuestions.filter(q => q.answer_count === 0);
            break;
          case 'trending':
            filteredQuestions.sort((a, b) => {
              const aScore = new Date(a.created_at).getTime() + (a.vote_count * 1000 * 60 * 60);
              const bScore = new Date(b.created_at).getTime() + (b.vote_count * 1000 * 60 * 60);
              return bScore - aScore;
            });
            break;
          case 'popular':
            filteredQuestions.sort((a, b) => b.vote_count - a.vote_count);
            break;
        }
        
        // Simulate pagination for demo
        const startIndex = (page - 1) * questionsPerPage;
        const endIndex = startIndex + questionsPerPage;
        const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);
        
        if (append) {
          setQuestions(prev => [...prev, ...paginatedQuestions]);
        } else {
          setQuestions(paginatedQuestions);
        }
        
        setHasMoreQuestions(endIndex < filteredQuestions.length);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    } else {
      // No Supabase connection - use demo questions only
      let filteredQuestions = [...demoQuestions];
      
      // Apply tag filter to demo questions
      if (selectedFilterTag) {
        filteredQuestions = filteredQuestions.filter(q => 
          q.tags.includes(selectedFilterTag)
        );
      }
      
      // Apply search filter to demo questions
      if (searchQuery) {
        filteredQuestions = filteredQuestions.filter(q => 
          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Apply sorting to demo questions
      switch (sortBy) {
        case 'newest':
          filteredQuestions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'unanswered':
          filteredQuestions = filteredQuestions.filter(q => q.answer_count === 0);
          break;
        case 'trending':
          filteredQuestions.sort((a, b) => {
            const aScore = new Date(a.created_at).getTime() + (a.vote_count * 1000 * 60 * 60);
            const bScore = new Date(b.created_at).getTime() + (b.vote_count * 1000 * 60 * 60);
            return bScore - aScore;
          });
          break;
        case 'popular':
          filteredQuestions.sort((a, b) => b.vote_count - a.vote_count);
          break;
      }
      
      // Simulate pagination for demo
      const startIndex = (page - 1) * questionsPerPage;
      const endIndex = startIndex + questionsPerPage;
      const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);
      
      if (append) {
        setQuestions(prev => [...prev, ...paginatedQuestions]);
      } else {
        setQuestions(paginatedQuestions);
      }
      
      setHasMoreQuestions(endIndex < filteredQuestions.length);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchQuestions(nextPage, true);
  };

  const handleTagFilter = (tag: string) => {
    setSelectedFilterTag(tag);
  };

  const clearTagFilter = () => {
    setSelectedFilterTag(null);
  };

  const handleSortChange = (newSort: 'newest' | 'unanswered' | 'popular' | 'trending') => {
    setSortBy(newSort);
  };

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[tag.length % colors.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery 
              ? `Search results for "${searchQuery}"` 
              : selectedFilterTag 
                ? `Questions tagged with "${selectedFilterTag}"` 
                : 'All Questions'
            }
          </h1>
          <p className="text-gray-600">{questions.length} questions</p>
        </div>
        
        <Link
          to="/ask"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-flex items-center"
        >
          Ask Question
        </Link>
      </div>

      {/* Active Tag Filter */}
      {selectedFilterTag && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-sm text-blue-800">
            Filtering by tag: <strong>{selectedFilterTag}</strong>
          </span>
          <button
            onClick={clearTagFilter}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Clear filter
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleSortChange('newest')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            sortBy === 'newest'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Newest
        </button>
        <button
          onClick={() => handleSortChange('unanswered')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            sortBy === 'unanswered'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Unanswered
        </button>
        <button
          onClick={() => handleSortChange('trending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            sortBy === 'trending'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-1 inline" />
          Trending
        </button>
        <button
          onClick={() => handleSortChange('popular')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            sortBy === 'popular'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Popular
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No questions found' : 'No questions yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms or browse all questions'
                : 'Be the first to ask a question!'
              }
            </p>
            {!searchQuery && (
              <Link
                to="/ask"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-flex items-center"
              >
                Ask Question
              </Link>
            )}
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Question Title */}
                  <Link
                    to={`/question/${question.id}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors block mb-2"
                  >
                    {question.title}
                  </Link>

                  {/* Question Description Preview */}
                  <div
                    className="text-gray-700 mb-4 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: question.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                    }}
                  />

                  {/* Tags */}
                  {question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags.map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => handleTagFilter(tag)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105 cursor-pointer ${
                            selectedFilterTag === tag 
                              ? 'bg-blue-600 text-white' 
                              : getTagColor(tag)
                          }`}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {question.answer_count} answers
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {question.users?.username || 'Unknown'}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right text-sm text-gray-500 ml-4">
                  <div className="font-medium text-gray-900">{question.vote_count}</div>
                  <div>votes</div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Load More Button */}
        {!loading && questions.length > 0 && hasMoreQuestions && (
          <div className="text-center pt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading more...
                </div>
              ) : (
                'Load More Questions'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}