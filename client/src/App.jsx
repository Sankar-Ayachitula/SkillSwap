import { useState, useContext } from "react";
import { AuthContext } from "./utils/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import AuthPage from "./components/AuthPage.jsx";
import BrowseSkills from "./components/BrowseSkills.jsx";
import MySkills from "./components/MySkills.jsx";
import Sessions from "./components/Sessions.jsx";
import Profile from "./components/Profile.jsx";

export default function App() {
  const { user, loading } = useContext(AuthContext);
  const [page, setPage] = useState("browse");

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-body)",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={() => setPage("browse")} />;
  }

  let content;
  switch (page) {
    case "my-skills":
      content = <MySkills />;
      break;
    case "sessions":
      content = <Sessions />;
      break;
    case "profile":
      content = <Profile onNavigate={setPage} />;
      break;
    default:
      content = <BrowseSkills onNavigate={setPage} />;
      break;
  }

  return (
    <>
      <Navbar currentPage={page} onNavigate={setPage} />
      <main>{content}</main>
    </>
  );
}
