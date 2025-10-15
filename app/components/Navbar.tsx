import { Link } from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="flex items-center">
                <img src="/assets/hirelens-logo.png" alt="HireLens" className="h-10 w-auto" />
            </Link>
            <Link to="/upload" className="primary-button w-fit">
                Upload Resume
            </Link>
        </nav>
    )
}
export default Navbar
