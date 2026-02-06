import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthStateHandler } from "@/components/auth/AuthStateHandler";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Field Officer Pages
import FieldDashboard from "./pages/field/FieldDashboard";
import MeetingsList from "./pages/field/MeetingsList";
import NewMeeting from "./pages/field/NewMeeting";
import DistributionPage from "./pages/field/DistributionPage";
import SalesPage from "./pages/field/SalesPage";
import ProfilePage from "./pages/field/ProfilePage";
import OdometerPage from "./pages/field/OdometerPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const FieldRouteLayout = () => <Outlet />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthStateHandler />
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Field Officer Routes */}
            <Route path="/field" element={<FieldRouteLayout />}>
              <Route index element={<FieldDashboard />} />
              <Route path="meetings" element={<MeetingsList />} />
              <Route path="meetings/new" element={<NewMeeting />} />
              <Route path="distribution" element={<DistributionPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="odometer" element={<OdometerPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
