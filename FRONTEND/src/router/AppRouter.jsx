import PlacementAIAssistant from "../pages/placement/placementAIAssistant/placementAIAssistant";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import SmartCampus from "../App";
import StudentDashboard from "../pages/Student/studentDashboard/studentDashboard";
import FacultyDashboard from "../pages/Faculty/facultyDashboard/facultyDashboard";
import PlacementDashboard from "../pages/placement/placementDashboard/placementDashboard";
import PlacementStudents from "../pages/placement/placementStudents/placementStudents";
import PlacementCompanies from "../pages/placement/placementCompanies/placementCompanies";
import PlacementDrives from "../pages/placement/placementDrives/placementDrives";
import PlacementOffersPlaced from "../pages/placement/placementOffersPlaced/placementOffersPlaced";
import PlacementInternships from "../pages/placement/placementInternships/placementInternships";
import RoleRoute from "./RoleRoute";
import PlacementAnalytics from "../pages/placement/placementAnalytics/placementAnalytics";
import PlacementProfile from "../pages/placement/placementProfile/placementProfile";
import PlacementReports from "../pages/placement/placementReports/placementReports";


const SD = (
  <RoleRoute allowedRoles={["student", "admin"]}>
    <StudentDashboard />
  </RoleRoute>
);

const router = createBrowserRouter([
    {
      path: "/placementdashboard/ai-assistant",
      element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementAIAssistant /></RoleRoute>,
    },
    {
      path: "/placementdashboard/Reports",
      element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementReports /></RoleRoute>,
    },
  // ──────── AUTH ROUTES ────────
  { path: "/",                element: <SmartCampus /> },
  { path: "/login",           element: <SmartCampus defaultModal="login" /> },
  { path: "/register",        element: <SmartCampus defaultModal="signup" /> },
  { path: "/forgot-password", element: <SmartCampus defaultModal="forgot" /> },
  { path: "/studentdashboard",          element: SD },
  { path: "/studentdashboard/:page",    element: SD },
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

  // ──────── PLACEMENT DASHBOARD ROUTES ────────
  {
    path: "/placementdashboard",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementDashboard /></RoleRoute>,
  },
  {
    path: "/placementdashboard/Analytics",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementAnalytics /></RoleRoute>,
  },
  {
    path: "/placementdashboard/students",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementStudents /></RoleRoute>,
  },
  {
    path: "/placementdashboard/companies",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementCompanies /></RoleRoute>,
  },
  {
    path: "/placementdashboard/drives",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementDrives /></RoleRoute>,
  },
  {
    path: "/placementdashboard/offers-placed",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementOffersPlaced /></RoleRoute>,
  },
  {
    path: "/placementdashboard/internships",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementInternships /></RoleRoute>,
  },
  {
    path: "/placementdashboard/placementProfile",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementProfile /></RoleRoute>,
  },

  //  ──────── ADMIN DASHBOARD ROUTE ────────
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