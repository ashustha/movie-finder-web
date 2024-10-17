import { ReactNode } from "react";
// import Navbar from "../components/navbar";
import Footer from "../ui/footer/Footer";
import TopNavbar from "../ui/topNavbar/TopNavbar";
import Search from "../ui/search/Search";

interface LayoutProps {
    children : ReactNode;
}

const Layout = ({ children } : LayoutProps) => {
    return (

        <>
        <TopNavbar/>
            <Search />
{/*          <Navbar /> */}
         {children}
         <Footer />
        </>
    )
}

export default Layout
