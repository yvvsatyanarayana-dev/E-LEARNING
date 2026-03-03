import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SmartCampus from "../App";
import StudentDashboard from "../pages/Student/studentDashboard/studentDashboard";
import FacultyDashboard from "../pages/Faculty/facultyDashboard/facultyDashboard";
import RoleRoute from "./RoleRoute";


const router = createBrowserRouter([
  { path: "/", element: <SmartCampus /> },
  { path: "/login", element: <SmartCampus defaultModal="login" /> },
  { path: "/register", element: <SmartCampus defaultModal="signup" /> },
  { path: "/forgot-password", element: <SmartCampus defaultModal="forgot" /> },

  { path: "/studentdashboard", element: (
      <RoleRoute allowedRoles={["student", "admin"]}>
        <StudentDashboard />
      </RoleRoute>
    )
  },

  { path: "/facultydashboard", element: (
      <RoleRoute allowedRoles={["faculty", "admin"]}>
        <FacultyDashboard />
      </RoleRoute>
    )
  },

  { path: "/studentdashboard/studentAnalytics", element: <StudentDashboard /> },

  { path: "/facultydashboard/facultyAnalytics", element: <FacultyDashboard /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}