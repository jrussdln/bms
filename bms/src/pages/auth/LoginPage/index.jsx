import MediaRoute from "../../../routes/MediaRoute";
import LoginForm from "./LoginForm";
import { useLoginForm } from "./useLoginForm";

export default function LoginPage() {
  const { form, error, loading, handleChange, handleSubmit } = useLoginForm();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={MediaRoute.logo} alt="Logo" className="w-14 h-14 mb-3" />
          <h1 className="text-lg font-semibold text-indigo-950 dark:text-indigo-200">
            Budget Management System
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Sign in to continue
          </p>
        </div>

        <LoginForm
          form={form}
          error={error}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          ©DevRuss 2026. Budget Management System.
        </p>
      </div>
    </div>
  );
}