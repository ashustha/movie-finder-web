
import { Link } from "react-router-dom";

const navLinks = [
    {
        name: 'Home',
        link: "/"
    },
    {
        name: 'News',
        link: "/news"
    },
    {
        name: 'PopularMovies',
        link: "/popularMovies"
    },
];

const Navbar = () => {
    // const location = useLocation();
    return (
        <>
            <nav>
                {navLinks.map((item) => (
                    <Link key={item.name} to={item.link}>{item.name}</Link>
                ))}
            </nav>
        </>
    );
};

export default Navbar;
