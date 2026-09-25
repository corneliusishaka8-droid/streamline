import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { useLocation } from "react-router"

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

function PageAnimations({ children }) {
    const { pathname } = useLocation()

    useGSAP(() => {
        const root = document.querySelector(".page-animation-root")
        if (!root) return

        root.querySelectorAll(".animate-title").forEach((element) => {
            SplitText.create(element, {
                type: "lines, words",
                linesClass: "split-line",
                wordsClass: "split-word",
                mask: "lines",
                autoSplit: true,
                onSplit: (self) => gsap.from(self.words, {
                    yPercent: 105,
                    autoAlpha: 0,
                    duration: 0.85,
                    stagger: 0.035,
                    ease: "power3.out",
                }),
            })
        })
        gsap.from(root.querySelectorAll(".home-header, .featured-content > *, .login-card"), {
            y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: "power2.out",
        })

        root.querySelectorAll("main > section, .browse-heading, .catalog-block, .movie-card, .legal-page h2, .details-content, .details-section, .profilepiciv, .myaccc .work").forEach((element) => {
            gsap.from(element, {
                y: 34, autoAlpha: 0, duration: 0.65, ease: "power2.out",
                scrollTrigger: { trigger: element, start: "top 88%", once: true },
            })
        })
    }, { dependencies: [pathname], revertOnUpdate: true })

    return <div className="page-animation-root" key={pathname}>{children}</div>
}

export default PageAnimations
