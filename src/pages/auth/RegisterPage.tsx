import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Scale, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthIllustration from "@/components/AuthIllustration";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import { useAuth, extractErrorMessage } from "@/context/AuthContext";
import PageTransition from "@/components/ui/PageTransition";

// Mirrors the backend's UserCreate validation exactly (app/schemas/user.py):
// min 8 chars, at least one letter, at least one digit.
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name").max(120),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Za-z]/, "Must contain at least one letter")
      .regex(/\d/, "Must contain at least one digit"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch("password") ?? "";

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await registerUser({
        full_name: values.fullName,
        email: values.email,
        password: values.password,
      });
      setSucceeded(true);
      setTimeout(() => navigate("/dashboard", { replace: true }), 900);
    } catch (error) {
      setServerError(
        extractErrorMessage(error, "Couldn't create your account. Please try again.")
      );
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

            <AnimatePresence mode="wait">
              {succeeded ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <CheckCircle2 size={48} className="text-emerald-400" />
                  <p className="mt-4 font-display text-lg font-semibold text-ink">
                    Account created
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">Taking you to your dashboard…</p>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }}>
                  <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
                  <p className="mt-1 text-sm text-ink-muted">
                    Free to start — upload your first document in under a minute.
                  </p>

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
                      <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-ink">
                        Full name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        {...register("fullName")}
                        aria-invalid={!!errors.fullName}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-neon/50"
                        placeholder="Asha Rao"
                      />
                      {errors.fullName && (
                        <p className="mt-1.5 text-xs text-red-400">{errors.fullName.message}</p>
                      )}
                    </div>

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
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-neon/50"
                        placeholder="you@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          {...register("password")}
                          aria-invalid={!!errors.password}
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
                      <PasswordStrengthMeter password={passwordValue} />
                      {errors.password && (
                        <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-1.5 block text-sm font-medium text-ink"
                      >
                        Confirm password
                      </label>
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...register("confirmPassword")}
                        aria-invalid={!!errors.confirmPassword}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-neon/50"
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full disabled:opacity-60"
                    >
                      {isSubmitting ? "Creating account…" : "Create account"}
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-ink-muted">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-neon-soft hover:underline">
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
