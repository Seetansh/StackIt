import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDemoQuestions } from '../contexts/DemoQuestionsContext';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import { supabase } from '../lib/supabase';

interface Tag {
  value: string;
  label: string;
  color: string;
}

const availableTags: Tag[] = [
  { value: 'javascript', label: 'JavaScript', color: '#F7DF1E' },
  { value: 'react', label: 'React', color: '#61DAFB' },
  { value: 'typescript', label: 'TypeScript', color: '#3178C6' },
  { value: 'css', label: 'CSS', color: '#1572B6' },
  { value: 'html', label: 'HTML', color: '#E34F26' },
  { value: 'node', label: 'Node.js', color: '#339933' },
  { value: 'python', label: 'Python', color: '#3776AB' },
  { value: 'sql', label: 'SQL', color: '#4479A1' },
  { value: 'api', label: 'API', color: '#FF6B6B' },
  { value: 'database', label: 'Database', color: '#4ECDC4' },
];

export default function EditQuestion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { demoQuestions, updateQuestion } = useDemoQuestions();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchQuestion();
    }
  }, [id, user, demoQuestions]);

  const fetchQuestion = async () => {
    if (!id || !user) return;
    
    setLoading(true);
    
    // Try to fetch from database first
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('id', id)
          .eq('author_id', user.id) // Ensure user can only edit their own questions
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Question not found or you do not have permission to edit it');
          } else {
            throw error;
          }
        } else {
          setTitle(data.title);
          setDescription(data.content);
          
          // Convert tags to Tag objects
          const questionTags = (data.tags || []).map((tag: string) => {
            const availableTag = availableTags.find(t => t.value === tag);
            return availableTag || { value: tag, label: tag, color: '#3B82F6' };
          });
          setSelectedTags(questionTags);
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        setError('Failed to load question');
      }
    } else {
      // Fallback to demo questions
      const question = demoQuestions.find(q => q.id === id);
      if (question) {
        if (question.user_id !== user.id) {
          setError('You can only edit your own questions');
        } else {
          setTitle(question.title);
          setDescription(question.content);
          
          // Convert tags to Tag objects
          const questionTags = question.tags.map(tag => {
            const availableTag = availableTags.find(t => t.value === tag);
            return availableTag || { value: tag, label: tag, color: '#3B82F6' };
          });
          setSelectedTags(questionTags);
        }
      } else {
        setError('Question not found');
      }
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user || !id) {
      setError('Please log in to edit questions');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (supabase) {
        // Try to update in database first
        const { error } = await supabase
          .from('questions')
          .update({
            title: title.trim(),
            content: description.trim(),
            tags: selectedTags.map(tag => tag.value),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('author_id', user.id); // Ensure user can only update their own questions

        if (error) throw error;
        
        // Also update in demo context for immediate UI update
        updateQuestion(id, {
          title: title.trim(),
          content: description.trim(),
          tags: selectedTags.map(tag => tag.value),
          updated_at: new Date().toISOString(),
        });
        
        navigate(`/question/${id}`);
      } else {
        // Fallback to demo mode only
        updateQuestion(id, {
          title: title.trim(),
          content: description.trim(),
          tags: selectedTags.map(tag => tag.value),
          updated_at: new Date().toISOString(),
        });
        
        alert('Question updated successfully! (Demo mode - not persisted)');
        navigate(`/question/${id}`);
      }
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to edit questions.</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/my/questions')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Back to My Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Question</h1>
        <p className="text-gray-600">
          Update your question to make it clearer or add more details.
        </p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            <strong>Demo Mode:</strong> Changes will be visible during this session but won't be permanently saved.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Question Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your programming question? Be specific."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Be specific and imagine you're asking a question to another person
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Question Details *
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Provide more details about your question. Include what you've tried and what specific help you need."
            />
            <p className="mt-1 text-sm text-gray-500">
              Include all the information someone would need to answer your question
            </p>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <TagInput
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              availableTags={availableTags}
            />
            <p className="mt-1 text-sm text-gray-500">
              Add up to 5 tags to describe what your question is about
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Updating...' : 'Update Question'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(`/question/${id}`)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}