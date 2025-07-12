import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useDemoQuestions } from '../contexts/DemoQuestionsContext';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';

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

export default function AskQuestion() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addQuestion } = useDemoQuestions();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('Please log in to ask a question');
      return;
    }

    setIsSubmitting(true);
    

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('questions')
          .insert({
            title,
            content: description,
            author_id: user.id,
            tags: selectedTags.map(tag => tag.value),
          })
          .select()
          .single();

        if (error) throw error;
        
        // Also add to demo context for immediate UI update
        const newQuestion = {
          ...data,
          users: { username: user.email?.split('@')[0] || 'User' }
        };
        addQuestion(newQuestion);
        
        // Clear form
        setTitle('');
        setDescription('');
        setSelectedTags([]);
        
        navigate(`/question/${data.id}`);
      } catch (error) {
        console.error('Error creating question:', error);
        setError('Failed to create question. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Fallback to demo mode if Supabase is not available
      const newQuestion = {
        id: `demo-${Date.now()}`,
        title: title.trim(),
        content: description.trim(),
        tags: selectedTags.map(tag => tag.value),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        answer_count: 0,
        vote_count: 0,
        users: { username: user.email?.split('@')[0] || 'User' }
      };
      
      addQuestion(newQuestion);
      
      setTimeout(() => {
        alert('Question posted successfully! (Demo mode - not persisted)');
        setTitle('');
        setDescription('');
        setSelectedTags([]);
        setIsSubmitting(false);
        navigate('/');
      }, 1000);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to ask a question.</p>
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
        <p className="text-gray-600">
          Get help from the community by asking a detailed question.
        </p>
        {!supabase && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              <strong>Demo Mode:</strong> Supabase is not connected. Your question won't be saved but you can test the form.
            </p>
          </div>
        )}
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
              {isSubmitting ? 'Posting...' : 'Post Question'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
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