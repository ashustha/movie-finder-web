import { NavLink, useNavigate } from 'react-router-dom';
import './sidebar.scss';
import ListGroup from 'react-bootstrap/esm/ListGroup';
import { Button } from 'react-bootstrap';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Function to determine the className based on active status
  const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'active' : '';

  return (
    <div className="sidebar sidebar-fixed">
      <div className="sidebar-nav">
        <div className="sidebar-wrapper">
          <header>
            <h2>MFS - Admin</h2>
          </header>
          <ListGroup>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => getNavLinkClassName({ isActive })}
            >
              <ListGroup.Item>Dashboard</ListGroup.Item>
            </NavLink>
            <NavLink
              to="/movies"
              className={({ isActive }) => getNavLinkClassName({ isActive })}
            >
              <ListGroup.Item>Movies</ListGroup.Item>
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) => getNavLinkClassName({ isActive })}
            >
              <ListGroup.Item>Users</ListGroup.Item>
            </NavLink>
            <NavLink
              to="/dws"
              className={({ isActive }) => getNavLinkClassName({ isActive })}
            >
              <ListGroup.Item>DWS</ListGroup.Item>
            </NavLink>
            <NavLink
              to="/news"
              className={({ isActive }) => getNavLinkClassName({ isActive })}
            >
              <ListGroup.Item>News</ListGroup.Item>
            </NavLink>
          </ListGroup>
          <footer>
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
