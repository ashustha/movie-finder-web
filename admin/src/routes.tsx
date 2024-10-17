import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Movies from './pages/Movies/Movies';
import Users from './pages/Users/Users';
import AddMovies from './pages/AddMovies/AddMovies';
import PrivateRoute from './utilities/PrivateRoute';
import NotFound from './pages/NotFound';
import Dws from './pages/DWS/Dws';
import UpdateMovies from './pages/UpdateMovies/UpdateMovies';
import UserDetail from './pages/UserDetail/UserDetail';
import News from './pages/News/News';
import AddNews from './pages/AddNews/AddNews';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <PrivateRoute element={<Dashboard />} />,
  },
  {
    path: '/movies',
    element: <PrivateRoute element={<Movies />} />,
  },
  {
    path: '/users',
    element: <PrivateRoute element={<Users />} />,
  },
  {
    path: '/userDetail/:id',
    element: <PrivateRoute element={<UserDetail />} />,
  },
  {
    path: '/addMovie',
    element: <PrivateRoute element={<AddMovies />} />,
  },
  {
    path: '/updateMovie/:id',
    element: <PrivateRoute element={<UpdateMovies />} />,
  },
  {
    path: '/dws',
    element: <PrivateRoute element={<Dws />} />,
  },
  {
    path: '/news',
    element: <PrivateRoute element={<News />} />,
  },
  {
    path: '/addNews',
    element: <PrivateRoute element={<AddNews />} />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
