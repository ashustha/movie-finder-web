import { createBrowserRouter } from 'react-router-dom';
import Homepage from './pages/homePage';
import Error from './pages/error';
import MovieDetail from './pages/movieDetail/MovieDetail';
import ActorDetail from './pages/actorDetail/actorDetail';
import News from './pages/News';
import PopularMovies from './pages/popularMovies/popularmovies';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import SearchResult from './pages/SearchResult/SearchResult';
import PublicProfile from './pages/PublicProfile/PublicProfile';

export const router = createBrowserRouter([
  {
    path: '',
    element: <Homepage />,
    errorElement: <Error />,
  },
  {
    path: 'movieDetail/:movieId',
    element: <MovieDetail />,
    errorElement: <Error />,
  },
  {
    path: 'actorDetail',
    element: <ActorDetail />,
    errorElement: <Error />,
  },
  {
    path: 'news',
    element: <News />,
    errorElement: <Error />,
  },
  {
    path: 'popularMovies',
    element: <PopularMovies />,
    errorElement: <Error />,
  },
  {
    path: 'register',
    element: <Register />,
    errorElement: <Error />,
  },
  {
    path: 'login',
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: 'profile',
    element: <Profile />,
    errorElement: <Error />,
  },
  {
    path: 'searchresult',
    element: <SearchResult />,
    errorElement: <Error />,
  },
  {
    path: 'userprofile/:userId/:userName',
    element: <PublicProfile />,
    errorElement: <Error />,
  },
]);
