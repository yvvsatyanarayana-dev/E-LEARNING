import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import SmartCampus from "../App";
import StudentDashboard from "../pages/Student/studentDashboard/studentDashboard";
import FacultyDashboard from "../pages/Faculty/facultyDashboard/facultyDashboard";
import RoleRoute from "./RoleRoute";

const router = createBrowserRouter([
  {
    path: "/studentdashboard/studentInternships",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/studentdashboard/studentMockInterview",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },

  // ── Public ─────────────────────────────────────────────────
  { path: "/", element: <SmartCampus /> },
  { path: "/login", element: <SmartCampus defaultModal="login" /> },
  { path: "/register", element: <SmartCampus defaultModal="signup" /> },
  { path: "/forgot-password", element: <SmartCampus defaultModal="forgot" /> },

  // ── Student sub-pages — all render <StudentDashboard /> ───────────────────
  {
    path: "/studentdashboard",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/studentdashboard/studentAnalytics",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/studentdashboard/studentMycourses",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/studentdashboard/studentVideoLectures",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/studentdashboard/studentAssignments",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/studentdashboard/studentQuizzes",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/studentdashboard/studentStudyGroups",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/studentdashboard/studentSchedule",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/studentdashboard/studentInnovationHub",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },
  // ────────────────────────────────────────────────────────────
  // NEW: Placement Prep route
  // ────────────────────────────────────────────────────────────
  {
    path: "/studentdashboard/studentPlacementPrep",
    element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    ),
  },

  // ── Faculty ─────────────────────────────────────────────────
  {
    path: "/facultydashboard",
    element: (
      <RoleRoute allowedRoles={["faculty", "admin"]}>
        <FacultyDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/facultydashboard/facultyAnalytics",
    element: (
      <RoleRoute allowedRoles={["faculty", "admin"]}>
        <FacultyDashboard />
      </RoleRoute>
    ),
  },

  // ── Placement & Admin ────────────────────────────────────────
  {
    path: "/placementdashboard",
    element: (
      <RoleRoute allowedRoles={["placement_officer", "admin"]}>
        <div>Placement Dashboard — coming soon</div>
      </RoleRoute>
    ),
  },
  {
    path: "/admindashboard",
    element: (
      <RoleRoute allowedRoles={["admin"]}>
        <div>Admin Dashboard — coming soon</div>
      </RoleRoute>
    ),
  },

  // ── Catch-all ────────────────────────────────────────────────
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}