import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DemoQuestionsProvider } from './contexts/DemoQuestionsContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AskQuestion from './pages/AskQuestion';
import QuestionDetail from './pages/QuestionDetail';
import MyQuestions from './pages/MyQuestions';
import EditQuestion from './pages/EditQuestion';

function App() {
  return (
    <AuthProvider>
      <DemoQuestionsProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/question/:id" element={<QuestionDetail />} />
                    <Route
                      path="/ask"
                      element={
                        <ProtectedRoute>
                          <AskQuestion />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my/questions"
                      element={
                        <ProtectedRoute>
                          <MyQuestions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/edit-question/:id"
                      element={
                        <ProtectedRoute>
                          <EditQuestion />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </Router>
      </DemoQuestionsProvider>
    </AuthProvider>
  );
}

export default App;