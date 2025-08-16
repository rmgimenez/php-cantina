import { LoginForm } from "../components/auth/login-form";
import { useAuth } from "../hooks/use-auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LoginForm />
    </div>
  );
}
