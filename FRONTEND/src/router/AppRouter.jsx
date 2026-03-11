// AppRouter.jsx  — updated with Faculty Profile & Settings routes
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import SmartCampus from "../App";
import StudentDashboard from "../pages/Student/studentDashboard/studentDashboard";
import FacultyDashboard from "../pages/Faculty/facultyDashboard/facultyDashboard";
import FacultyQuickaction from "../pages/Faculty/facultyQuickaction/facultyQuickaction";
import FacultyNotification from "../pages/Faculty/facultyNotification/facultyNotification";
import RoleRoute from "./RoleRoute";
import ErrorBoundary from "./ErrorBoundary";

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
  { path: "/",                element: <SmartCampus />, errorElement: <ErrorBoundary /> },
  { path: "/login",           element: <SmartCampus defaultModal="login" />, errorElement: <ErrorBoundary /> },
  { path: "/register",        element: <SmartCampus defaultModal="signup" /> },
  { path: "/forgot-password", element: <SmartCampus defaultModal="forgot" /> },

  // ──────── STUDENT DASHBOARD ROUTES ────────
  { 
    path: "/studentdashboard", 
    element: SD, 
    errorElement: <ErrorBoundary /> 
  },
  { path: "/studentdashboard/studentAnalytics",          element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentMycourses",          element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentVideoLectures",      element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentAssignments",        element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentQuizzes",            element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentStudyGroups",        element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentSchedule",           element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentInnovationHub",      element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentPlacementPrep",      element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentInternships",        element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentMockInterview",      element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentSettings",           element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentProfile",            element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentResume",             element: SD, errorElement: <ErrorBoundary /> },

  // ──────── FACULTY DASHBOARD ROUTES ────────
  {
    path: "/facultydashboard",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/facultyAnalytics",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/facultyMycourse",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/facultyVideoLectures",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/facultyAssignments",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/facultyQuizzes",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/allStudents",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/attendance",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/gradeBook",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/questionBank",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/aiAssistant",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/reports",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/settings",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/profile",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/quickactions",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/facultydashboard/notifications",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },

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