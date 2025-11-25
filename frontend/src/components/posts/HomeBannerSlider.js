import React from "react";
import "./HomeBannerSlider.css";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    title: "Welcome to Friend Chat!",
    desc: "Connect with fellow USIU students anonymously, match by interests, and join campus conversations.",
    action: { label: "Find Matches", to: "/matching" },
    image: "/banner/match.svg"
  },
  {
    title: "Lost Something?",
    desc: "Check the Lost & Found board for items around campus, or report what you've found.",
    action: { label: "View Lost & Found", to: "/lost-found" },
    image: "/banner/lostfound.svg"
  },
  {
    title: "Campus Feed",
    desc: "Share memes, ask questions, and stay updated with campus events in the general posts feed.",
    action: { label: "Explore Posts", to: "/" },
    image: "/banner/posts.svg"
  }
];

export default function HomeBannerSlider() {
  const [idx, setIdx] = React.useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(() => setIdx(i => (i + 1) % slides.length), 5000);
    return () => clearTimeout(timer);
  }, [idx]);

  const slide = slides[idx];

  return (
    <div className="home-banner-slider">
      <div className="banner-content">
        <img src={slide.image} alt="banner" className="banner-img" />
        <div className="banner-text">
          <h2>{slide.title}</h2>
          <p>{slide.desc}</p>
          <button className="banner-action" onClick={() => navigate(slide.action.to)}>{slide.action.label}</button>
        </div>
      </div>
      <div className="banner-dots">
        {slides.map((_, i) => (
          <span key={i} className={i === idx ? "dot active" : "dot"} onClick={() => setIdx(i)} />
        ))}
      </div>
    </div>
  );
}
