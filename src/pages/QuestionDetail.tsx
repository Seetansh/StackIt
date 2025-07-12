import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useDemoQuestions } from '../contexts/DemoQuestionsContext';
import RichTextEditor from '../components/RichTextEditor';
import { ArrowUp, ArrowDown, Check, MessageSquare, Calendar, User, Tag, Home, ChevronRight } from 'lucide-react';

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

interface Answer {
  id: string;
  question_id: string;
  content: string;
  user_id: string;
  vote_score: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  users: {
    username: string;
    avatar_url?: string;
  };
}

// Demo questions data
const demoQuestions: { [key: string]: Question } = {
  'demo-1': {
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
  'demo-2': {
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
  'demo-3': {
    id: 'demo-3',
    title: 'Best practices for API error handling in JavaScript',
    description: `<p>What are the recommended patterns for handling errors when making API calls? Should I use try-catch or .catch()?</p>
    
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
  'demo-4': {
    id: 'demo-4',
    title: 'How to optimize SQL queries for better performance?',
    description: `<p>My database queries are running slowly. What are some general tips to improve SQL query performance?</p>
    
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
  'demo-5': {
    id: 'demo-5',
    title: 'TypeScript vs JavaScript: When to use which?',
    description: `<p>I'm starting a new project and wondering whether I should use TypeScript or stick with JavaScript. What are the pros and cons?</p>
    
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
  'demo-6': {
    id: 'demo-6',
    title: 'How to implement authentication in Node.js?',
    description: `<p>I need to add user authentication to my Node.js application. What are the best libraries and practices for secure authentication?</p>
    
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
  'demo-7': {
    id: 'demo-7',
    title: 'Understanding Python decorators',
    description: `<p>I keep seeing @decorator syntax in Python code but I don't understand how they work. Can someone explain decorators with simple examples?</p>
    
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
  'demo-8': {
    id: 'demo-8',
    title: 'Git merge vs rebase: Which one to use?',
    description: `<p>I'm confused about when to use git merge and when to use git rebase. What are the differences and best practices?</p>
    
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
  'demo-9': {
    id: 'demo-9',
    title: 'How to handle state management in large React apps?',
    description: `<p>My React application is getting complex and prop drilling is becoming a problem. Should I use Context API, Redux, or Zustand?</p>
    
    <p>I have components that are 5-6 levels deep and passing props through all of them is becoming unwieldy. Here's a simplified example:</p>
    
    <pre><code>function App() {
  const [user, setUser] = useState(null);
  return &lt;Dashboard user={user} setUser={setUser} /&gt;;
}

function Dashboard({ user, setUser }) {
  return &lt;Sidebar user={user} setUser={setUser} /&gt;;
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
  'demo-10': {
    id: 'demo-10',
    title: 'CSS Grid vs Flexbox: When to use each?',
    description: `<p>I'm learning CSS layout techniques and I'm confused about when to use CSS Grid and when to use Flexbox. What are the use cases for each?</p>
    
    <p>I understand that both can be used for layout, but I'm not sure which one to choose for different scenarios. For example, should I use Grid for my main page layout and Flexbox for components?</p>
    
    <p>Here's a layout I'm trying to create:</p>
    <pre><code>&lt;div class="container"&gt;
  &lt;header&gt;Header&lt;/header&gt;
  &lt;nav&gt;Navigation&lt;/nav&gt;
  &lt;main&gt;Main Content&lt;/main&gt;
  &lt;aside&gt;Sidebar&lt;/aside&gt;
  &lt;footer&gt;Footer&lt;/footer&gt;
&lt;/div&gt;</code></pre>`,
    tags: ['css', 'grid', 'flexbox'],
    user_id: 'demo-user-10',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    answer_count: 3,
    vote_count: 14,
    users: { username: 'CSSNinja' }
  },
  'demo-11': {
    id: 'demo-11',
    title: 'Docker containerization best practices',
    description: `<p>I'm new to Docker and want to containerize my web application. What are the best practices for writing Dockerfiles and managing containers?</p>
    
    <p>My application is a Node.js API with a React frontend. I'm not sure if I should use one container or separate containers for each service.</p>
    
    <p>Here's my current Dockerfile:</p>
    <pre><code>FROM node:16
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]</code></pre>
    
    <p>Is this a good approach?</p>`,
    tags: ['docker', 'containerization', 'devops'],
    user_id: 'demo-user-11',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    answer_count: 2,
    vote_count: 7,
    users: { username: 'DevOpsEngineer' }
  },
  'demo-12': {
    id: 'demo-12',
    title: 'How to optimize website performance?',
    description: `<p>My website is loading slowly and I want to improve the performance. What are the key metrics to monitor and optimization techniques to implement?</p>
    
    <p>I've run a Lighthouse audit and got the following scores:</p>
    <ul>
      <li>Performance: 45</li>
      <li>Accessibility: 78</li>
      <li>Best Practices: 83</li>
      <li>SEO: 92</li>
    </ul>
    
    <p>The main issues seem to be large image files and render-blocking JavaScript. What should I prioritize?</p>`,
    tags: ['performance', 'optimization', 'web'],
    user_id: 'demo-user-12',
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    answer_count: 4,
    vote_count: 22,
    users: { username: 'PerfExpert' }
  },
  'demo-13': {
    id: 'demo-13',
    title: 'Understanding async/await in JavaScript',
    description: `<p>I'm struggling with asynchronous JavaScript. Can someone explain how async/await works and when to use it instead of Promises?</p>
    
    <p>I understand the concept of Promises, but async/await syntax is confusing me. Here's what I'm trying to do:</p>
    
    <pre><code>function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data;
    });
}</code></pre>
    
    <p>How would I convert this to use async/await? And what are the benefits?</p>`,
    tags: ['javascript', 'async', 'promises'],
    user_id: 'demo-user-13',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    answer_count: 3,
    vote_count: 16,
    users: { username: 'AsyncMaster' }
  },
  'demo-14': {
    id: 'demo-14',
    title: 'MongoDB vs PostgreSQL: Which database to choose?',
    description: `<p>I'm starting a new project and need to choose between MongoDB and PostgreSQL. What are the pros and cons of each for different use cases?</p>
    
    <p>My project will handle user profiles, posts, comments, and real-time messaging. I expect to have complex relationships between data but also need good performance for read-heavy operations.</p>
    
    <p>Here's my current data structure thinking:</p>
    <pre><code>User {
  id, username, email, profile_data
}

Post {
  id, user_id, content, created_at, tags[]
}

Comment {
  id, post_id, user_id, content, parent_comment_id
}</code></pre>`,
    tags: ['database', 'mongodb', 'postgresql'],
    user_id: 'demo-user-14',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    answer_count: 5,
    vote_count: 35,
    users: { username: 'DatabasePro' }
  },
  'demo-15': {
    id: 'demo-15',
    title: 'How to implement responsive design without frameworks?',
    description: `<p>I want to create a responsive website using only vanilla CSS without Bootstrap or other frameworks. What are the key techniques and media queries to use?</p>
    
    <p>I'm building a portfolio website and want to understand the fundamentals before using any frameworks. Here's my current approach:</p>
    
    <pre><code>.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
}</code></pre>
    
    <p>What other breakpoints and techniques should I consider?</p>`,
    tags: ['css', 'responsive', 'mobile'],
    user_id: 'demo-user-15',
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    answer_count: 2,
    vote_count: 9,
    users: { username: 'ResponsiveDesigner' }
  },
  'demo-16': {
    id: 'demo-16',
    title: 'Testing strategies for React applications',
    description: `<p>What are the best practices for testing React components? Should I use Jest, React Testing Library, or Cypress for different types of tests?</p>
    
    <p>I'm working on a React application and want to implement a comprehensive testing strategy. I'm confused about the different types of tests and when to use each.</p>
    
    <p>Here's a component I want to test:</p>
    <pre><code>function UserProfile({ user, onEdit }) {
  const [editing, setEditing] = useState(false);
  
  return (
    &lt;div&gt;
      {editing ? (
        &lt;EditForm user={user} onSave={onEdit} /&gt;
      ) : (
        &lt;UserDisplay user={user} onEdit={() =&gt; setEditing(true)} /&gt;
      )}
    &lt;/div&gt;
  );
}</code></pre>`,
    tags: ['react', 'testing', 'jest'],
    user_id: 'demo-user-16',
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    answer_count: 3,
    vote_count: 13,
    users: { username: 'TestingExpert' }
  },
  'demo-17': {
    id: 'demo-17',
    title: 'RESTful API design principles',
    description: `<p>I'm building my first REST API and want to follow best practices. What are the key principles for designing clean and maintainable RESTful APIs?</p>
    
    <p>I'm creating an API for a blog application with posts, comments, and users. Here's my current endpoint structure:</p>
    
    <pre><code>GET /posts
POST /posts
GET /posts/:id
PUT /posts/:id
DELETE /posts/:id

GET /posts/:id/comments
POST /posts/:id/comments</code></pre>
    
    <p>Is this following REST conventions correctly? What about authentication and error handling?</p>`,
    tags: ['api', 'rest', 'backend'],
    user_id: 'demo-user-17',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    answer_count: 4,
    vote_count: 28,
    users: { username: 'APIArchitect' }
  },
  'demo-18': {
    id: 'demo-18',
    title: 'How to secure web applications from common vulnerabilities?',
    description: `<p>I want to make sure my web application is secure. What are the most common security vulnerabilities and how can I prevent them?</p>
    
    <p>I'm building a web application that handles user data and payments. I've heard about OWASP Top 10 but I'm not sure how to implement the security measures.</p>
    
    <p>My current setup includes:</p>
    <ul>
      <li>Node.js backend with Express</li>
      <li>React frontend</li>
      <li>PostgreSQL database</li>
      <li>JWT for authentication</li>
    </ul>
    
    <p>What security measures should I prioritize?</p>`,
    tags: ['security', 'web', 'vulnerabilities'],
    user_id: 'demo-user-18',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    answer_count: 2,
    vote_count: 11,
    users: { username: 'SecuritySpecialist' }
  },
  'demo-19': {
    id: 'demo-19',
    title: 'Understanding closures in JavaScript',
    description: `<p>I keep hearing about closures in JavaScript but I don't fully understand the concept. Can someone explain closures with practical examples?</p>
    
    <p>I've read that closures are when a function has access to variables from its outer scope, but I'm not sure when this is useful or how to use it effectively.</p>
    
    <p>Here's an example I found online:</p>
    <pre><code>function outerFunction(x) {
  return function innerFunction(y) {
    return x + y;
  };
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 8</code></pre>
    
    <p>Why is this better than just passing both parameters to a single function?</p>`,
    tags: ['javascript', 'closures', 'functions'],
    user_id: 'demo-user-19',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    answer_count: 3,
    vote_count: 17,
    users: { username: 'JSTeacher' }
  },
  'demo-20': {
    id: 'demo-20',
    title: 'CI/CD pipeline setup with GitHub Actions',
    description: `<p>I want to set up automated testing and deployment for my project using GitHub Actions. What's a good starter workflow for a Node.js application?</p>
    
    <p>My project structure:</p>
    <ul>
      <li>Node.js backend with Jest tests</li>
      <li>React frontend with Cypress e2e tests</li>
      <li>Deployment to Heroku</li>
    </ul>
    
    <p>I want to:</p>
    <ol>
      <li>Run tests on every pull request</li>
      <li>Deploy to staging when merging to develop branch</li>
      <li>Deploy to production when merging to main branch</li>
    </ol>
    
    <p>Here's my current workflow file:</p>
    <pre><code>name: CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test</code></pre>`,
    tags: ['ci-cd', 'github-actions', 'automation'],
    user_id: 'demo-user-20',
    created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    answer_count: 3,
    vote_count: 21,
    users: { username: 'DevOpsGuru' }
  }
};

// Demo answers data
const demoAnswers: { [key: string]: Answer[] } = {
  'demo-1': [
    {
      id: 'answer-1',
      question_id: 'demo-1',
      content: `<p>You can use the <strong>CONCAT</strong> function or the <strong>||</strong> operator (depending on your database system):</p>
      
      <h3>Method 1: Using CONCAT function</h3>
      <pre><code>SELECT 
  first_name,
  last_name,
  CONCAT(first_name, ' ', last_name) AS full_name
FROM users;</code></pre>

      <h3>Method 2: Using || operator (PostgreSQL, SQLite)</h3>
      <pre><code>SELECT 
  first_name,
  last_name,
  first_name || ' ' || last_name AS full_name
FROM users;</code></pre>

      <h3>Method 3: Using + operator (SQL Server)</h3>
      <pre><code>SELECT 
  first_name,
  last_name,
  first_name + ' ' + last_name AS full_name
FROM users;</code></pre>

      <p>The <code>AS full_name</code> part creates an alias for the new column. The space <code>' '</code> between the names ensures they're properly separated.</p>`,
      user_id: 'expert-1',
      vote_score: 12,
      is_accepted: true,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      users: { username: 'SQLExpert' }
    },
    {
      id: 'answer-2',
      question_id: 'demo-1',
      content: `<p>Another approach is to use the <strong>CONCAT_WS</strong> function (CONCAT With Separator) which is available in MySQL and PostgreSQL:</p>
      
      <pre><code>SELECT 
  first_name,
  last_name,
  CONCAT_WS(' ', first_name, last_name) AS full_name
FROM users;</code></pre>

      <p>The advantage of <code>CONCAT_WS</code> is that it automatically handles NULL values - if either first_name or last_name is NULL, it won't include extra spaces.</p>
      
      <p>You can also add more fields:</p>
      <pre><code>SELECT 
  CONCAT_WS(' ', first_name, middle_name, last_name) AS full_name
FROM users;</code></pre>`,
      user_id: 'expert-2',
      vote_score: 8,
      is_accepted: false,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      users: { username: 'DatabasePro' }
    }
  ],
  'demo-2': [
    {
      id: 'answer-3',
      question_id: 'demo-2',
      content: `<p>This is a common React gotcha! The issue is that <strong>state updates are asynchronous</strong> and React batches them for performance.</p>
      
      <p>When you call <code>setCount(count + 1)</code>, React doesn't immediately update the <code>count</code> variable. Instead, it schedules the update for the next render.</p>

      <h3>Solution 1: Use useEffect to see the updated value</h3>
      <pre><code>const [count, setCount] = useState(0);

useEffect(() => {
  console.log('Count updated:', count);
}, [count]);

const handleClick = () => {
  setCount(count + 1);
  // Don't console.log here - use useEffect instead
};</code></pre>

      <h3>Solution 2: Use functional updates</h3>
      <pre><code>const handleClick = () => {
  setCount(prevCount => {
    const newCount = prevCount + 1;
    console.log('New count will be:', newCount);
    return newCount;
  });
};</code></pre>`,
      user_id: 'expert-3',
      vote_score: 15,
      is_accepted: true,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      users: { username: 'ReactMaster' }
    },
    {
      id: 'answer-4',
      question_id: 'demo-2',
      content: `<p>To add to the previous answer, here's why this happens:</p>
      
      <p>React uses a concept called "closures" in JavaScript. When you define your <code>handleClick</code> function, it "closes over" the current value of <code>count</code>. Even after you call <code>setCount</code>, the function still has the old value.</p>

      <p>Think of it like taking a snapshot - your function has a snapshot of <code>count</code> from when it was created.</p>

      <h3>Quick tip:</h3>
      <p>If you need to perform an action after state updates, use <code>useEffect</code> with the state variable as a dependency.</p>`,
      user_id: 'expert-4',
      vote_score: 6,
      is_accepted: false,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      users: { username: 'JSTeacher' }
    }
  ]
};

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { demoQuestions } = useDemoQuestions();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchQuestion();
      fetchAnswers();
    }
  }, [id]);

  const fetchQuestion = async () => {
    if (!id) return;
    
    // Check if this is a demo question ID
    if (id.startsWith('demo-')) {
      const demoQuestion = demoQuestions.find(q => q.id === id);
      if (demoQuestion) {
        setQuestion(demoQuestion);
      } else {
        setError('Question not found');
      }
      setLoading(false);
      return;
    }
    
    // Only proceed with Supabase for non-demo IDs
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            *,
            profiles (username, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Transform database data to match frontend interface
        const transformedQuestion = {
          ...data,
          vote_count: data.vote_score || 0,
          users: data.profiles || { username: 'Unknown' },
          tags: Array.isArray(data.tags) ? data.tags : [],
          user_id: data.author_id // Keep user_id for compatibility
        };
        
        setQuestion(transformedQuestion);
      } catch (error) {
        console.log('Database error:', error);
        setError('Question not found');
      }
    } else {
      setError('Question not found');
    }
    setLoading(false);
  };

  const fetchAnswers = async () => {
    if (!id) return;
    
    // Check if this is a demo question ID
    if (id.startsWith('demo-')) {
      const answers = demoAnswers[id];
      if (answers) {
        setAnswers(answers);
      } else {
        setAnswers([]);
      }
      return;
    }
    
    // Only proceed with Supabase for non-demo IDs
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('answers')
          .select(`
            *,
            profiles (username, avatar_url)
          `)
          .eq('question_id', id)
          .order('is_accepted', { ascending: false })
          .order('vote_score', { ascending: false })
          .order('created_at', { ascending: true });

        if (error) throw error;
        setAnswers(data || []);
      } catch (error) {
        console.log('Database error:', error);
        setAnswers([]);
      }
    } else {
      setQuestion(demoQuestions[id]);
      const demoQuestion = demoQuestions.find(q => q.id === id);
      if (demoQuestion) {
        setQuestion(demoQuestion);
      }
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAnswer.trim() || !id) return;

    // Check if this is a demo question
    if (id.startsWith('demo-')) {
      // Demo mode - simulate adding answer
      alert('Answer submitted successfully! (Demo mode - answer not actually saved)');
      setNewAnswer('');
      return;
    }

    if (!supabase) {
      setError('Database not available');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('answers')
        .insert({
          question_id: id,
          content: newAnswer,
          author_id: user.id,
        });

      if (error) throw error;

      setNewAnswer('');
      fetchAnswers();
      
      // Update answer count
      if (question) {
        await supabase
          .from('questions')
          .update({ answer_count: (question.answer_count || 0) + 1 })
          .eq('id', id);
        
        // Refresh question data to show updated count
        fetchQuestion();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError(`Failed to submit answer: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (answerId: string, voteType: 'up' | 'down') => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }
    
    if (!supabase) {
      // Demo mode - simulate voting
      alert(`Vote ${voteType} recorded! (Demo mode - vote not actually saved)`);
      return;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('answer_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('answer_id', answerId)
        .maybeSingle();

      if (existingVote) {
        // Update existing vote
        await supabase
          .from('answer_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
      } else {
        // Create new vote
        await supabase
          .from('answer_votes')
          .insert({
            user_id: user.id,
            answer_id: answerId,
            vote_type: voteType,
          });
      }

      // Recalculate votes for the answer
      const { data: votes } = await supabase
        .from('answer_votes')
        .select('vote_type')
        .eq('answer_id', answerId);

      const voteCount = votes?.reduce((acc, vote) => {
        return acc + (vote.vote_type === 'up' ? 1 : -1);
      }, 0) || 0;

      await supabase
        .from('answers')
        .update({ vote_score: voteCount })
        .eq('id', answerId);

      fetchAnswers();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question || question.user_id !== user.id) return;

    if (!supabase) {
      // Demo mode - simulate accepting answer
      alert('Answer accepted! (Demo mode - not actually saved)');
      return;
    }

    try {
      // Unaccept all other answers
      await supabase
        .from('answers')
        .update({ is_accepted: false })
        .eq('question_id', question.id);

      // Accept this answer
      await supabase
        .from('answers')
        .update({ is_accepted: true })
        .eq('id', answerId);

      fetchAnswers();
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Question not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Questions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/" className="flex items-center hover:text-blue-600 transition-colors">
          <Home className="w-4 h-4 mr-1" />
          Questions
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 truncate max-w-md">
          {question.title.length > 50 ? question.title.substring(0, 50) + '...' : question.title}
        </span>
      </nav>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
          
          {/* Question metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span className="font-medium">{question.users.username}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(question.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {question.answer_count} answers
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Question content */}
        <div 
          className="prose max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.content }}
        />
      </div>

      {/* Answers Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {answers.map((answer, index) => (
          <div
            key={answer.id}
            className={`bg-white rounded-lg shadow-sm border p-6 ${
              answer.is_accepted ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="flex space-x-6">
              {/* Vote buttons */}
              <div className="flex flex-col items-center space-y-3 min-w-[60px]">
                <button
                  onClick={() => handleVote(answer.id, 'up')}
                  disabled={!user}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={user ? "Vote up" : "Login to vote"}
                >
                  <ArrowUp className="w-6 h-6 text-gray-600" />
                </button>
                <span className="text-xl font-bold text-gray-900">
                  {answer.vote_score}
                </span>
                <button
                  onClick={() => handleVote(answer.id, 'down')}
                  disabled={!user}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={user ? "Vote down" : "Login to vote"}
                >
                  <ArrowDown className="w-6 h-6 text-gray-600" />
                </button>
                {question.user_id === user?.id && (
                  <button
                    onClick={() => handleAcceptAnswer(answer.id)}
                    className={`p-2 rounded-full transition-colors ${
                      answer.is_accepted
                        ? 'text-green-600 bg-green-100'
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title={answer.is_accepted ? "Accepted answer" : "Accept this answer"}
                  >
                    <Check className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Answer content */}
              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Answer {index + 1}
                    </h3>
                    {answer.is_accepted && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Accepted
                      </span>
                    )}
                  </div>
                </div>
                
                <div 
                  className="prose max-w-none mb-6 text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: answer.content }}
                />
                
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span className="font-medium">{answer.users.username}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(answer.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Your Answer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Submit Your Answer</h3>
        
        {user ? (
          <form onSubmit={handleSubmitAnswer} className="space-y-6">
            <div>
              <RichTextEditor
                value={newAnswer}
                onChange={setNewAnswer}
                placeholder="Write your answer here... Be detailed and helpful!"
                className="min-h-[200px]"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newAnswer.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">Please log in to post an answer.</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}