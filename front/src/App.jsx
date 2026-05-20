import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./ui/AppLayout";
import LoginForm from "./pages/LoginForm";
import SignupForm from "./pages/SignupForm";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Loading from "./pages/Loading";
import Dashboard from "./pages/DashBoard";
import SearchResources from "./pages/SearchResources";
import TeacherMaterials from "./pages/TeacherMaterials";
import UploadTextbook from "./pages/UploadTextbook";
import UploadDocument from "./pages/UploadDocument";
import VideoLibrary from "./pages/VideoLibrary";
import UploadVideo from "./pages/UploadVideo";
import LandingPage from "./pages/LandingPage";
import AdminUsers from "./pages/Admin/AdminUsers";
import Reports from "./pages/Admin/Reports";
import AdminSettings from "./pages/Admin/AdminSettings";
import CreateExercise from "./pages/CreateExercise";
import SecureReader from "./pages/SecureReader";
import StudentExercises from "./pages/StudentExercises";
import ExercisePractice from "./pages/ExercisePractice";
import ResourceManagement from "./pages/ResourceManagement";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import LibrarianCirculation from "./pages/LibrarianCirculation";
import ResourceDetail from "./pages/ResourceDetail";
import MyBorrows from "./pages/MyBorrows";
import SavedResources from "./pages/SavedResources";
import MyReservations from "./pages/MyReservations";
import TeacherVideoManagement from "./pages/TeacherVideoManagement";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

const ROLE_ACCESS = {
  dashboard: ["admin", "student", "teacher", "librarian"],
  search: ["admin", "student", "teacher", "librarian"],
  materials: ["student", "teacher"],
  reader: ["student", "teacher", "librarian"],
  uploadTextbook: ["teacher", "librarian"],
  uploadDocs: ["teacher"],
  createExercise: ["teacher"],
  exercises: ["student"],
  exercisePractice: ["student"],
  resourceManagement: ["teacher", "librarian"],
  videos: ["student"],
  uploadVideos: ["teacher"],
  teacherVideoManagement: ["teacher"],
  adminUsers: ["admin"],
  adminReports: ["admin"],
  adminSettings: ["admin"],
  circulation: ["librarian"],
  myBorrows: ["student", "teacher"],
  myReservations: ["student", "teacher"],
  savedResources: ["student", "teacher"],
  profile: ["admin", "student", "teacher", "librarian"],
  settings: ["admin", "student", "teacher", "librarian"],
};

const canAccess = (userRole, rule) => {
  if (!rule) return true;
  const allowed = Array.isArray(rule) ? rule : [rule];
  return allowed.includes(userRole);
};

const Guard = ({ role, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!canAccess(user.role, role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function DefaultRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? "/dashboard" : "/"} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <Routing />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Routing() {
  const { isLoading, user } = useAuth();

  const protectedRoutes = [
    {
      key: "my-borrows",
      path: "my-borrows",
      role: ROLE_ACCESS.myBorrows,
      element: <MyBorrows />,
    },
    {
      key: "my-reservations",
      path: "my-reservations",
      role: ROLE_ACCESS.myReservations,
      element: <MyReservations />,
    },
    {
      key: "saved-resources",
      path: "saved-resources",
      role: ROLE_ACCESS.savedResources,
      element: <SavedResources />,
    },
    {
      key: "catalog-detail",
      path: "catalog/:id",
      role: ROLE_ACCESS.search,
      element: <ResourceDetail />,
    },
    {
      key: "profile",
      path: "profile",
      role: ROLE_ACCESS.profile,
      element: <Profile />,
    },
    {
      key: "settings",
      path: "settings",
      role: ROLE_ACCESS.settings,
      element: <Settings />,
    },
    {
      key: "dashboard",
      path: "dashboard",
      role: ROLE_ACCESS.dashboard,
      element: <Dashboard />,
    },
    {
      key: "search",
      path: "search",
      role: ROLE_ACCESS.search,
      element: <SearchResources />,
    },
    {
      key: "catalog",
      path: "catalog",
      role: ROLE_ACCESS.search,
      element: <SearchResources />,
    },
    {
      key: "materials",
      path: "materials",
      role: ROLE_ACCESS.materials,
      element: <TeacherMaterials />,
    },
    {
      key: "teacher-materials",
      path: "catalog/classroom-materials",
      role: ROLE_ACCESS.materials,
      element: <TeacherMaterials />,
    },
    {
      key: "reader",
      path: "reader",
      role: ROLE_ACCESS.reader,
      element: <SecureReader />,
    },
    {
      key: "upload-textbook",
      path: "upload-textbook",
      role: ROLE_ACCESS.uploadTextbook,
      element: <UploadTextbook />,
    },
    {
      key: "upload-docs",
      path: "upload-docs",
      role: ROLE_ACCESS.uploadDocs,
      element: <UploadDocument />,
    },
    {
      key: "exercise",
      path: "exercise",
      role: ROLE_ACCESS.createExercise,
      element: <CreateExercise />,
    },
    {
      key: "exercises",
      path: "exercises",
      role: ROLE_ACCESS.exercises,
      element: <StudentExercises />,
    },
    {
      key: "exercise-detail",
      path: "exercises/:id",
      role: ROLE_ACCESS.exercisePractice,
      element: <ExercisePractice />,
    },
    {
      key: "resource-management",
      path: "resource-management",
      role: ROLE_ACCESS.resourceManagement,
      element: <ResourceManagement />,
    },
    {
      key: "teacher-resource-management",
      path: "teacher/resources/manage",
      role: ROLE_ACCESS.resourceManagement,
      element: <ResourceManagement />,
    },
    {
      key: "librarian-catalog",
      path: "librarian/catalog",
      role: ROLE_ACCESS.resourceManagement,
      element: <ResourceManagement />,
    },
    {
      key: "librarian-circulation",
      path: "librarian/circulation",
      role: ROLE_ACCESS.circulation,
      element: <LibrarianCirculation />,
    },
    {
      key: "videos",
      path: "videos",
      role: ROLE_ACCESS.videos,
      element: <VideoLibrary />,
    },
    {
      key: "catalog-videos",
      path: "catalog/videos",
      role: ROLE_ACCESS.videos,
      element: <VideoLibrary />,
    },
    {
      key: "upload-videos",
      path: "upload-videos",
      role: ROLE_ACCESS.uploadVideos,
      element: <UploadVideo />,
    },
    {
      key: "teacher-upload-videos",
      path: "teacher/upload-videos",
      role: ROLE_ACCESS.uploadVideos,
      element: <UploadVideo />,
    },
    {
      key: "teacher-video-management",
      path: "teacher/videos/manage",
      role: ROLE_ACCESS.teacherVideoManagement,
      element: <TeacherVideoManagement />,
    },
    {
      key: "teacher-upload-docs",
      path: "teacher/upload-docs",
      role: ROLE_ACCESS.uploadDocs,
      element: <UploadDocument />,
    },
    {
      key: "teacher-exercises-alias",
      path: "teacher/exercises",
      role: ROLE_ACCESS.createExercise,
      element: <CreateExercise />,
    },
    {
      key: "librarian-register-books",
      path: "librarian/register-books",
      role: ROLE_ACCESS.uploadTextbook,
      element: <UploadTextbook />,
    },
    {
      key: "admin-users",
      path: "admin/users",
      role: ROLE_ACCESS.adminUsers,
      element: <AdminUsers />,
    },
    {
      key: "admin-reports",
      path: "admin/reports",
      role: ROLE_ACCESS.adminReports,
      element: <Reports />,
    },
    {
      key: "admin-settings",
      path: "admin/settings",
      role: ROLE_ACCESS.adminSettings,
      element: <AdminSettings />,
    },
  ];

  const visibleRoutes = user
    ? protectedRoutes.filter((route) => canAccess(user.role, route.role))
    : [];

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {isLoading ? (
          <Route path="/*" element={<Loading />} />
        ) : (
          <Route
            element={
              <Guard>
                <AppLayout />
              </Guard>
            }
          >
            {visibleRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        )}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
