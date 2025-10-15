import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="flex items-center gap-2">
                <img src="/assets/logo.png" alt="HireLens Logo" className="h-8 w-auto" />
                <span className="text-2xl font-bold text-gradient">HireLens</span>
            </Link>
            <Link to="/upload" className="primary-button w-fit">
                Upload Resume
            </Link>
        </nav>
    )
}
export default Navbar
