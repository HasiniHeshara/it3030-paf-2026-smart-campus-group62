import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const role = params.get("role");
    const email = params.get("email");
    const fullName = params.get("fullName");
    const error = params.get("error");
    const oauthError = params.get("oauthError");

    console.log("OAuth redirect params:", {
      token,
      role,
      email,
      fullName,
      error,
      oauthError,
      fullUrl: window.location.href,
    });

    if (error || oauthError) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", {
        replace: true,
        state: {
          error: error || oauthError || "Google login failed",
        },
      });
      return;
    }

    if (!token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", {
        replace: true,
        state: {
          error: "Google login failed. No token received.",
        },
      });
      return;
    }

    const user = {
      email: email || "",
      fullName: fullName || "",
      role: role || "USER",
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if ((role || "").toUpperCase() === "ADMIN") {
      navigate("/admin-dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return <div style={{ padding: "40px" }}>Signing you in with Google...</div>;
}