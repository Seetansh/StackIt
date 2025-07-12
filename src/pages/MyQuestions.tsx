import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDemoQuestions } from '../contexts/DemoQuestionsContext';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Tag, Clock, User, Edit, Trash2, MoreVertical } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  answer_count: number;
  vote_count: number;
  user_id: string;
  users: {
    username: string;
  };
}

export default function MyQuestions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { demoQuestions, deleteQuestion } = useDemoQuestions();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyQuestions();
    } else {
      setLoading(false);
    }
  }, [user, demoQuestions]);

  const fetchMyQuestions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Try to fetch from database first
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            *,
            profiles (username, avatar_url)
          `)
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform database data to match frontend interface
        const transformedData = (data || []).map(item => ({
          ...item,
          vote_count: item.vote_score || 0,
          users: item.profiles || { username: 'Unknown' },
          tags: Array.isArray(item.tags) ? item.tags : [],
          user_id: item.author_id // Keep user_id for compatibility
        }));
        
        // Combine database questions with demo questions for this user
        const demoUserQuestions = demoQuestions.filter(q => q.user_id === user.id);
        const allUserQuestions = [...transformedData, ...demoUserQuestions];
        
        // Remove duplicates (prefer database version)
        const uniqueQuestions = allUserQuestions.reduce((acc, current) => {
          const existing = acc.find(q => q.id === current.id);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, [] as Question[]);
        
        setQuestions(uniqueQuestions);
      } catch (error) {
        console.log('Database error (tables may not exist). Using demo mode.', error);
        // Fallback to demo questions only
        const userQuestions = demoQuestions.filter(q => q.user_id === user.id);
        setQuestions(userQuestions);
      } finally {
        setLoading(false);
      }
    } else {
      // No Supabase connection - use demo questions only
      const userQuestions = demoQuestions.filter(q => q.user_id === user.id);
      setQuestions(userQuestions);
      setLoading(false);
    }
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

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      if (supabase) {
        try {
          const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', questionId)
            .eq('user_id', user?.id); // Ensure user can only delete their own questions

          if (error) throw error;
          
          // Also remove from demo context
          deleteQuestion(questionId);
        } catch (error) {
          console.error('Error deleting question:', error);
          alert('Failed to delete question. Please try again.');
        }
      } else {
        // Fallback to demo mode only
        deleteQuestion(questionId);
        alert('Question deleted! (Demo mode - not persisted)');
      }
    }
  };

  const handleEditQuestion = (questionId: string) => {
    navigate(`/edit-question/${questionId}`);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your questions</h2>
        <Link to="/login" className="text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </div>
    );
  }

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Questions</h1>
          <p className="text-gray-600">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
        </div>
        
        <Link
          to="/ask"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Ask Question
        </Link>
      </div>

      {/* Debug info - remove in production 
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Current User ID: {user.id}</p>
          <p>Total Demo Questions: {demoQuestions.length}</p>
          <p>User Questions Found: {questions.length}</p>
        </div>
      )}
*/}
      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-500 mb-4">Ask your first question to get started!</p>
            <Link
              to="/ask"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Ask Question
            </Link>
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
                        <span
                          key={index}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
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
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                {/* Stats and Actions */}
                <div className="flex items-start space-x-4 ml-4">
                  <div className="text-right text-sm text-gray-500">
                    <div className="font-medium text-gray-900">{question.vote_count}</div>
                    <div>votes</div>
                  </div>
                  
                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === question.id ? null : question.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {showDropdown === question.id && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowDropdown(null)}
                        />
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleEditQuestion(question.id);
                                setShowDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Question
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteQuestion(question.id);
                                setShowDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Question
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}