import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import UploadPage from "@/pages/dashboard/UploadPage";
import ChatPage from "@/pages/dashboard/ChatPage";
import SchemesPage from "@/pages/dashboard/SchemesPage";
import EligibilityPage from "@/pages/dashboard/EligibilityPage";
import HistoryPage from "@/pages/dashboard/HistoryPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import FeedbackPage from "@/pages/dashboard/FeedbackPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="schemes" element={<SchemesPage />} />
              <Route path="eligibility" element={<EligibilityPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
