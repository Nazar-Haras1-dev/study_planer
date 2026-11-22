import { createBrowserRouter, redirect } from 'react-router'
import AppLayout from '../layouts/AppLayout'
import TasksPage from '../pages/TasksPage'
import TaskDetailsPage from '../pages/TaskDetailsPage'
import LoginPage from '../pages/LoginPage'
import ProfilePage from '../pages/ProfilePage'
import NotFoundPage from '../pages/NotFoundPage'
import { redirectIfAuthenticatedLoader, requireAuthLoader } from './authLoaders'

/**
 * Data Mode: маршрути описані одним об'єктом і передаються в <RouterProvider>.
 * Layout це батьківський route, сторінки це його children (рендеряться в <Outlet />).
 * Захист маршруту /profile: loader перевіряє сесію ДО рендеру й робить redirect на /login.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, loader: () => redirect('/tasks') },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'tasks/:taskId', element: <TaskDetailsPage /> },
      { path: 'login', loader: redirectIfAuthenticatedLoader, element: <LoginPage /> },
      { path: 'profile', loader: requireAuthLoader, element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
