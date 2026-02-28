import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SmartCampus from "../App";
import StudentDashboard from "../pages/studentDashboard/studentDashboard";

// Auth modal state is managed inside SmartCampus (App.jsx).
// These routes render the landing page and can be extended
// to render dedicated pages for each auth flow if needed.

const router = createBrowserRouter([
  {
    path: "/",
    element: <SmartCampus />,
  },
  {
    path: "/login",
    element: <SmartCampus defaultModal="login" />,
  },
  {
    path: "/register",
    element: <SmartCampus defaultModal="signup" />,
  },
  {
    path: "/forgot-password",
    element: <SmartCampus defaultModal="forgot" />,
  },
  {
    path : "/studentdashboard",
    element : <StudentDashboard/>
  }
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}