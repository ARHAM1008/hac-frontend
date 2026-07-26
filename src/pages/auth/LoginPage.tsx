import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Scale, AlertCircle } from "lucide-react";
import AuthIllustration from "@/components/AuthIllustration";
import { useAuth, extractErrorMessage } from "@/context/AuthContext";
import PageTransition from "@/components/ui/PageTransition";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: true },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await login({ email: values.email, password: values.password });
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="grid min-h-screen lg:grid-cols-2">
        <AuthIllustration />

        <div className="flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-panel w-full max-w-md p-8"
          >
            <Link to="/" className="mb-8 flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon to-violet">
                <Scale size={16} className="text-void" aria-hidden="true" />
              </span>
              NyayaAI
            </Link>

            <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-muted">Sign in to continue to your dashboard.</p>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-5 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                role="alert"
              >
                <AlertCircle size={16} className="shrink-0" />
                {serverError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-neon/50"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-neon-soft hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 pr-10 text-sm text-ink placeholder:text-ink-faint focus:border-neon/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-ink-muted">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-neon"
                />
                Remember me
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-muted">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-neon-soft hover:underline">
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
