// AppRouter.jsx  — updated with Faculty Profile & Settings routes
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import SmartCampus from "../App";
import StudentDashboard from "../pages/Student/studentDashboard/studentDashboard";
import FacultyDashboard from "../pages/Faculty/facultyDashboard/facultyDashboard";
import FacultyQuickaction from "../pages/Faculty/facultyQuickaction/facultyQuickaction";
import FacultyNotification from "../pages/Faculty/facultyNotification/facultyNotification";
import RoleRoute from "./RoleRoute";

const SD = (
  <RoleRoute allowedRoles={["student", "admin"]}>
    <StudentDashboard />
  </RoleRoute>
);

const FD = (
  <RoleRoute allowedRoles={["faculty", "admin"]}>
    <FacultyDashboard />
  </RoleRoute>
);

const router = createBrowserRouter([
  // ──────── AUTH ROUTES ────────
  { path: "/",                element: <SmartCampus /> },
  { path: "/login",           element: <SmartCampus defaultModal="login" /> },
  { path: "/register",        element: <SmartCampus defaultModal="signup" /> },
  { path: "/forgot-password", element: <SmartCampus defaultModal="forgot" /> },

  // ──────── STUDENT DASHBOARD ROUTES ────────
  { path: "/studentdashboard",                           element: SD },
  { path: "/studentdashboard/studentAnalytics",          element: SD },
  { path: "/studentdashboard/studentMycourses",          element: SD },
  { path: "/studentdashboard/studentVideoLectures",      element: SD },
  { path: "/studentdashboard/studentAssignments",        element: SD },
  { path: "/studentdashboard/studentQuizzes",            element: SD },
  { path: "/studentdashboard/studentStudyGroups",        element: SD },
  { path: "/studentdashboard/studentSchedule",           element: SD },
  { path: "/studentdashboard/studentInnovationHub",      element: SD },
  { path: "/studentdashboard/studentPlacementPrep",      element: SD },
  { path: "/studentdashboard/studentInternships",        element: SD },
  { path: "/studentdashboard/studentMockInterview",      element: SD },
  { path: "/studentdashboard/studentSettings",           element: SD },
  { path: "/studentdashboard/studentProfile",            element: SD },
  { path: "/studentdashboard/studentResume",             element: SD },

  // ──────── FACULTY DASHBOARD ROUTES ────────
  { path: "/facultydashboard",                           element: FD },
  { path: "/facultydashboard/facultyAnalytics",          element: FD },
  { path: "/facultydashboard/facultyMycourse",           element: FD },
  { path: "/facultydashboard/facultyVideoLectures",      element: FD },
  { path: "/facultydashboard/facultyAssignments",        element: FD },
  { path: "/facultydashboard/facultyQuizzes",            element: FD },
  { path: "/facultydashboard/allStudents",               element: FD },
  { path: "/facultydashboard/attendance",                element: FD },
  { path: "/facultydashboard/gradeBook",                 element: FD },
  { path: "/facultydashboard/questionBank",              element: FD },
  { path: "/facultydashboard/aiAssistant",               element: FD },
  { path: "/facultydashboard/reports",                   element: FD },
  // ── NEW: Profile & Settings ──
  { path: "/facultydashboard/profile",                   element: FD },
  { path: "/facultydashboard/settings",                  element: FD },
  // ── Quickactions & Notifications ──
  { path: "/facultydashboard/quickactions",              element: <FacultyQuickaction /> },
  { path: "/facultydashboard/notifications",             element: <FacultyNotification /> },

  // ──────── OTHER DASHBOARD ROUTES ────────
  {
    path: "/placementdashboard",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><div>Placement Dashboard — coming soon</div></RoleRoute>,
  },
  {
    path: "/admindashboard",
    element: <RoleRoute allowedRoles={["admin"]}><div>Admin Dashboard — coming soon</div></RoleRoute>,
  },

  // ──────── FALLBACK ROUTE ────────
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}