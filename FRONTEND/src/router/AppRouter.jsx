import PlacementAIAssistant from "../pages/placement/placementAIAssistant/placementAIAssistant";
// AppRouter.jsx  — updated with Faculty Profile & Settings routes
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
import PlacementMeeting from "../pages/placement/placementMeeting/placementMeeting";
import StudentPlacementMeetings from "../pages/Student/studentPlacementMeetings/studentPlacementMeetings";


import FacultyQuickaction from "../pages/Faculty/facultyQuickaction/facultyQuickaction";
import FacultyNotification from "../pages/Faculty/facultyNotification/facultyNotification";

import AdminDashboard from "../pages/Admin/AdminDashboard/AdminDashboard";
import AdminAnalyticsMonitoring from "../pages/Admin/AdminAnalyticsMonitoring/AdminAnalyticsMonitoring";
import AdminUserManagement from "../pages/Admin/AdminUserManagement/AdminUserManagement";
import AdminCourseManagement from "../pages/Admin/AdminCourseManagement/AdminCourseManagement";
import AdminReports from "../pages/Admin/AdminReports/AdminReports";
import Department from "../pages/Admin/Department/Department";
import Placement from "../pages/Admin/Placement/Placement";
import ActivityLog from "../pages/Admin/ActivityLog/ActivityLog";
import Security from "../pages/Admin/adminSecurity/adminSecurity";
import Settings from "../pages/Admin/adminSettings/adminSettings";
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
    {
      path: "/placementdashboard/ai-assistant",
      element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementAIAssistant /></RoleRoute>,
    },
    {
      path: "/placementdashboard/Reports",
      element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementReports /></RoleRoute>,
    },
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
  { path: "/studentdashboard/studentMeetings",           element: SD, errorElement: <ErrorBoundary /> },
  { path: "/studentdashboard/studentPlacementMeetings",  element: SD, errorElement: <ErrorBoundary /> },

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
  {
    path: "/facultydashboard/meetings",
    element: <RoleRoute allowedRoles={["faculty","admin"]}><FacultyDashboard/></RoleRoute>,
    errorElement: <ErrorBoundary />,
  },

  // ──────── PLACEMENT DASHBOARD ROUTES ────────
  {
    path: "/placementdashboard",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementDashboard /></RoleRoute>,
  },
  {
    path: "/placementdashboard/analytics",
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
  {
    path: "/placementdashboard/meetings",
    element: <RoleRoute allowedRoles={["placement_officer","admin"]}><PlacementMeeting /></RoleRoute>,
  },


  //  ──────── ADMIN DASHBOARD ROUTE ────────
  {
    path: "/admindashboard",
    element: <RoleRoute allowedRoles={["admin"]}><AdminDashboard/></RoleRoute>,
  },
  {
    path: "/admindashboard/adminAnalytics",
    element: <RoleRoute allowedRoles={["admin"]}><AdminAnalyticsMonitoring /></RoleRoute>,
  },
  {
    path: "/admindashboard/userManagement",
    element: <RoleRoute allowedRoles={["admin"]}><AdminUserManagement /></RoleRoute>,
  },
  {
    path: "/admindashboard/courseManagement",
    element: <RoleRoute allowedRoles={["admin"]}><AdminCourseManagement /></RoleRoute>,
  },
  {
    path: "/admindashboard/adminReports",
    element: <RoleRoute allowedRoles={["admin"]}><AdminReports /></RoleRoute>,
  },
  {
    path: "/admindashboard/department",
    element: <RoleRoute allowedRoles={["admin"]}><Department /></RoleRoute>,
  },
  {
    path: "/admindashboard/placement",
    element: <RoleRoute allowedRoles={["admin"]}><Placement /></RoleRoute>,
  },
  {
    path: "/admindashboard/activitylog",
    element: <RoleRoute allowedRoles={["admin"]}><ActivityLog /></RoleRoute>,
  },
  {
    path: "/admindashboard/security",
    element: <RoleRoute allowedRoles={["admin"]}><Security /></RoleRoute>,
  },
  {
    path: "/admindashboard/settings",
    element: <RoleRoute allowedRoles={["admin"]}><Settings /></RoleRoute>,
  },
  // ──────── FALLBACK ROUTE ────────
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}