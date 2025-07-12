import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
  answer_count: number;
  vote_count: number;
  users: {
    username: string;
    avatar_url?: string;
  };
}

interface DemoQuestionsContextType {
  demoQuestions: Question[];
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
}

const DemoQuestionsContext = createContext<DemoQuestionsContextType | undefined>(undefined);

// Initial demo questions data
const initialDemoQuestions: Question[] = [
  {
    id: 'demo-1',
    title: 'How to join 2 columns in a data set to make a separate column in SQL',
    content: `<p>I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name, and column 2 consists of last name I want a column to combine both.</p>
    
    <p>I've tried using CONCAT but I'm not sure about the exact syntax. Can someone help me with the proper SQL syntax?</p>
    
    <p>Here's what I have so far:</p>
    <pre><code>SELECT first_name, last_name FROM users;</code></pre>
    
    <p>But I want to create a new column that combines both names.</p>`,
    tags: ['sql', 'database', 'concat'],
    user_id: 'demo-user-1',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    answer_count: 2,
    vote_count: 15,
    users: { username: 'SQLBeginner' }
  },
  {
    id: 'demo-2',
    title: 'React useState not updating immediately',
    content: `<p>I'm calling setState but when I console.log the state right after, it shows the old value. Why is this happening?</p>
    
    <p>Here's my code:</p>
    <pre><code>const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  console.log(count); // This shows the old value!
};</code></pre>`,
    tags: ['react', 'javascript', 'hooks'],
    user_id: 'demo-user-2',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    answer_count: 2,
    vote_count: 8,
    users: { username: 'ReactDev' }
  },
  {
    id: 'demo-3',
    title: 'Best practices for API error handling in JavaScript',
    content: `<p>What are the recommended patterns for handling errors when making API calls? Should I use try-catch or .catch()?</p>
    
    <p>I'm working on a project where I need to make multiple API calls and I want to handle errors gracefully. Here's what I'm currently doing:</p>
    
    <pre><code>fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));</code></pre>
    
    <p>But I'm not sure if this is the best approach. What are the industry standards?</p>`,
    tags: ['javascript', 'api', 'error-handling'],
    user_id: 'demo-user-3',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    answer_count: 3,
    vote_count: 23,
    users: { username: 'JSExpert' }
  },
  {
    id: 'demo-4',
    title: 'How to optimize SQL queries for better performance?',
    content: `<p>My database queries are running slowly. What are some general tips to improve SQL query performance?</p>
    
    <p>I have a table with about 100,000 records and some of my queries are taking several seconds to complete. Here's an example of a slow query:</p>
    
    <pre><code>SELECT * FROM users 
WHERE created_at > '2023-01-01' 
AND status = 'active' 
ORDER BY last_login DESC;</code></pre>
    
    <p>What can I do to make this faster?</p>`,
    tags: ['sql', 'database', 'performance'],
    user_id: 'demo-user-4',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    answer_count: 2,
    vote_count: 4,
    users: { username: 'DBAdmin' }
  },
  {
    id: 'demo-5',
    title: 'TypeScript vs JavaScript: When to use which?',
    content: `<p>I'm starting a new project and wondering whether I should use TypeScript or stick with JavaScript. What are the pros and cons?</p>
    
    <p>My team has experience with JavaScript but we're considering TypeScript for better type safety. However, I'm concerned about the learning curve and build complexity.</p>
    
    <p>What factors should I consider when making this decision?</p>`,
    tags: ['typescript', 'javascript', 'development'],
    user_id: 'demo-user-5',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    answer_count: 4,
    vote_count: 31,
    users: { username: 'CodeGuru' }
  },
  {
    id: 'demo-6',
    title: 'How to implement authentication in Node.js?',
    content: `<p>I need to add user authentication to my Node.js application. What are the best libraries and practices for secure authentication?</p>
    
    <p>I'm building a REST API and need to handle user registration, login, and protected routes. Should I use JWT tokens or sessions?</p>
    
    <p>Here's my basic Express setup:</p>
    <pre><code>const express = require('express');
const app = express();

app.post('/login', (req, res) => {
  // What should go here?
});</code></pre>`,
    tags: ['node', 'authentication', 'security'],
    user_id: 'demo-user-6',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    answer_count: 3,
    vote_count: 18,
    users: { username: 'NodeMaster' }
  },
  {
    id: 'demo-7',
    title: 'Understanding Python decorators',
    content: `<p>I keep seeing @decorator syntax in Python code but I don't understand how they work. Can someone explain decorators with simple examples?</p>
    
    <p>For example, I see code like this:</p>
    <pre><code>@app.route('/home')
def home():
    return 'Hello World'</code></pre>
    
    <p>What is @app.route doing exactly? How can I create my own decorators?</p>`,
    tags: ['python', 'decorators', 'functions'],
    user_id: 'demo-user-7',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    answer_count: 2,
    vote_count: 12,
    users: { username: 'PythonGuru' }
  },
  {
    id: 'demo-8',
    title: 'Git merge vs rebase: Which one to use?',
    content: `<p>I'm confused about when to use git merge and when to use git rebase. What are the differences and best practices?</p>
    
    <p>My team is working on a feature branch and we need to integrate our changes back to main. I've heard that rebase creates a cleaner history, but merge is safer. Which approach should we use?</p>
    
    <p>Here's our current workflow:</p>
    <pre><code>git checkout feature-branch
git add .
git commit -m "Add new feature"
git checkout main
git merge feature-branch</code></pre>`,
    tags: ['git', 'version-control', 'workflow'],
    user_id: 'demo-user-8',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    answer_count: 3,
    vote_count: 25,
    users: { username: 'GitExpert' }
  },
  {
    id: 'demo-9',
    title: 'How to handle state management in large React apps?',
    content: `<p>My React application is getting complex and prop drilling is becoming a problem. Should I use Context API, Redux, or Zustand?</p>
    
    <p>I have components that are 5-6 levels deep and passing props through all of them is becoming unwieldy. Here's a simplified example:</p>
    
    <pre><code>function App() {
  const [user, setUser] = useState(null);
  return <Dashboard user={user} setUser={setUser} />;
}

function Dashboard({ user, setUser }) {
  return <Sidebar user={user} setUser={setUser} />;
}

// This continues for several more levels...</code></pre>`,
    tags: ['react', 'state-management', 'redux'],
    user_id: 'demo-user-9',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    answer_count: 4,
    vote_count: 19,
    users: { username: 'ReactPro' }
  },
  {
    id: 'demo-10',
    title: 'CSS Grid vs Flexbox: When to use each?',
    content: `<p>I'm learning CSS layout techniques and I'm confused about when to use CSS Grid and when to use Flexbox. What are the use cases for each?</p>
    
    <p>I understand that both can be used for layout, but I'm not sure which one to choose for different scenarios. For example, should I use Grid for my main page layout and Flexbox for components?</p>
    
    <p>Here's a layout I'm trying to create:</p>
    <pre><code><div class="container">
  <header>Header</header>
  <nav>Navigation</nav>
  <main>Main Content</main>
  <aside>Sidebar</aside>
  <footer>Footer</footer>
</div></code></pre>`,
    tags: ['css', 'grid', 'flexbox'],
    user_id: 'demo-user-10',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    answer_count: 3,
    vote_count: 14,
    users: { username: 'CSSNinja' }
  }
];

export function DemoQuestionsProvider({ children }: { children: ReactNode }) {
  const [demoQuestions, setDemoQuestions] = useState<Question[]>(initialDemoQuestions);

  const addQuestion = (question: Question) => {
    setDemoQuestions(prev => [question, ...prev]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setDemoQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, ...updates } : q)
    );
  };

  const deleteQuestion = (id: string) => {
    setDemoQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <DemoQuestionsContext.Provider value={{ demoQuestions, addQuestion, updateQuestion, deleteQuestion }}>
      {children}
    </DemoQuestionsContext.Provider>
  );
}

export function useDemoQuestions() {
  const context = useContext(DemoQuestionsContext);
  if (context === undefined) {
    throw new Error('useDemoQuestions must be used within a DemoQuestionsProvider');
  }
  return context;
}