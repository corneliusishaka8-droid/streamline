import Myacc from "../components/myaccount"
import { Link } from "react-router"
import { useAppState } from "../lib/AppState"

function Profile(){
    const { user } = useAppState()
    return(
        <div className="profile">
            <div className="profille-head">
               <Link className="profilepiciv" to="/login" title="Sign in or edit profile" aria-label="Sign in or edit profile">
                    <svg className="profilepic" viewBox="0 0 100 100" role="img" aria-label="Default profile avatar">
                        <circle cx="50" cy="50" r="50" fill="#d9e5e2" />
                        <circle cx="50" cy="36" r="17" fill="#647772" />
                        <path d="M17 88c3-19 15-29 33-29s30 10 33 29v2H17z" fill="#647772" />
                    </svg>
                    <span className="profilepic-add">+</span>
               </Link>
                <h1 className="animate-title">welcome {user?.name || "guest"}</h1>
                <nav><ul>
                    <li><Link to="/profile">my account</Link></li>
                    <li><Link to="/my-lists">my lists</Link></li>
                </ul>
                </nav>
            </div>
            <Myacc />
        </div>
    )
}

export default Profile
