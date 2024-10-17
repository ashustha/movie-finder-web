import { ReactNode } from "react";
import Sidebar from "../components/sidebar/sidebar";
import './layout.scss'

interface LayoutProps {
    children : ReactNode;
}

const Layout = ({ children } : LayoutProps) => {
    return (

        <>
        <Sidebar/>
        <div className="layout">
         {children}
        </div>
        </>
    )
}

export default Layout
