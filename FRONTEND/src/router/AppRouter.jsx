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
  {
    path: "/facultydashboard",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/facultyAnalytics",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/facultyMycourse",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/facultyVideoLectures",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/facultyAssignments",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/facultyQuizzes",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/allStudents",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/attendance",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/gradeBook",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/questionBank",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/aiAssistant",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
  },
  {
    path: "/facultydashboard/reports",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
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