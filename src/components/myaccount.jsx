import things from "../lib/things"
import { Link } from "react-router"

function Acc(){
    return(
        <div className="myaccc">
            {/* The callback must return JSX; without a return, map renders nothing. */}
            {things.map((thing) => (
                <Link className="work" key={thing.id} to={thing.name === "privacy" ? "/privacy" : thing.name === "policies" ? "/policies" : thing.name === "my profile" ? "/login" : thing.name === "my lists" ? "/my-lists" : "mailto:support@streamline.example"}>
                 <div className="work-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                        {thing.name === "my profile" && <>
                            <circle cx="12" cy="8" r="3.5" />
                            <path d="M5 21c.5-4 3-6 7-6s6.5 2 7 6" />
                        </>}
                        {thing.name === "my lists" && <><path d="M4 5h16M4 12h16M4 19h16" /><path d="m7 3 2 2-2 2m0 3 2 2-2 2m0 3 2 2-2 2" /></>}
                        {thing.name === "contact" && <>
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="m4 7 8 6 8-6" />
                        </>}
                        {thing.name === "privacy" && <>
                            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                            <rect x="9" y="10" width="6" height="5" rx="1" />
                            <path d="M10 10V8a2 2 0 0 1 4 0v2" />
                        </>}
                        {thing.name === "policies" && <>
                            <path d="M6 3h8l4 4v14H6z" />
                            <path d="M14 3v5h5M9 13h6M9 17h6" />
                        </>}
                    </svg>
                 </div>
                <div className="dick">
                    <h1 title={thing.name === "my profile" ? "Coming soon" : undefined}>{thing.name}</h1>
                <p> {thing.des}</p>
                 </div>
                <svg className="work-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
                </Link>
            ))}
            <footer className="account-footer">
                <p>&copy; 2026 Movie App. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default Acc
