import { RouteObject, Outlet, Navigate } from "react-router-dom"

import { MainLayout, AuthLayout } from '@renderer/components/layout';
import PublicRoute from "@renderer/hocs/PublicRoute";
import ProtectedRoute from "@renderer/hocs/ProtectedRoute";

import { route as Login } from '@renderer/pages/Login';
import { route as Register } from '@renderer/pages/Register';
import { route as Dashboard } from '@renderer/pages/Dashboard';
import { route as ProjectDetails } from '@renderer/pages/Projects';
import { route as TaskBoard } from '@renderer/pages/TaskBoard';
import { route as Notes } from '@renderer/pages/Notes';
import { route as Statistics } from '@renderer/pages/Statistics';
import { route as Settings } from '@renderer/pages/Settings';
import { route as NotFound } from '@renderer/pages/NotFound';

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <PublicRoute children={<AuthLayout />} />,
        children: [
            { index: true, element: <Navigate to="/login" replace /> },
            { path: "login", ...Login, },
            { path: "register", ...Register, },
        ]
    },
    {
        path: "/",
        element: <ProtectedRoute children={<MainLayout children={<Outlet />} />} />,
        children: [
            { index: true, element: <Navigate to="/home" replace /> },
            { path: "dashboard", ...Dashboard, },
            { path: "projects/:projectId", ...ProjectDetails, },
            { path: "projects/:projectId/tasks", ...TaskBoard, },
            { path: "notes", ...Notes, },
            { path: "notes/:folderId", ...Notes, },
            { path: "statistics", ...Statistics, },
            { path: "settings", ...Settings, },
            { path: "*", ...NotFound, },
        ]
    }
];
