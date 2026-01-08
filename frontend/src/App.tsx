import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import JobAnalyzer from './pages/JobAnalyzer';
import CareerChat from './pages/CareerChat';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import CareerRoadmap from './pages/CareerRoadmap';
import InterviewPractice from './pages/InterviewPractice';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="resume" element={<ResumeBuilder />} />
        <Route path="jobs" element={<JobAnalyzer />} />
        <Route path="career-chat" element={<CareerChat />} />
        <Route path="skill-gap" element={<SkillGapAnalysis />} />
        <Route path="roadmap" element={<CareerRoadmap />} />
        <Route path="interview" element={<InterviewPractice />} />
      </Route>
    </Routes>
  );
}

export default App;
