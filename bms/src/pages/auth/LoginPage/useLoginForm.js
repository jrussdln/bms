import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { ROUTES } from "../../../constants/routes";
import { AUTH_MESSAGES } from "../../../constants/messages";

export function useLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ strEmail: "", strPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname ?? ROUTES.DASHBOARD;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? AUTH_MESSAGES.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return { form, error, loading, handleChange, handleSubmit };
}