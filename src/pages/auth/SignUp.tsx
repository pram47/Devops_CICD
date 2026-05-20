import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import logo from "@/assets/icons/JobbyEmployer.png";
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type {
  SignUpFormErrors,
  SignUpFormState,
} from "@/types/authSignUpTypes";
import {
  authClient,
  hydrateAuthStoreFromPayload,
  hydrateCompanyIdFromUserId,
  hydrateAuthStoreFromSession,
} from "@/services/authClient";
import { useAuthStore } from "@/store/auth";

const initialFormState: SignUpFormState = {
  email: "",
  password: "",
  acceptedTerms: false,
};

function validateSignUpForm(values: SignUpFormState): SignUpFormErrors {
  const errors: SignUpFormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.email.trim()) {
    errors.email = "Please enter your email";
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Please enter your password";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = "Please accept terms and condition";
  }

  return errors;
}

export default function SignUpPage() {
  const [formState, setFormState] = useState<SignUpFormState>(initialFormState);
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const isFormValid = useMemo(() => {
    return Object.keys(validateSignUpForm(formState)).length === 0;
  }, [formState]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg("");

    const nextErrors = validateSignUpForm(formState);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const email = formState.email.trim();
      const fallbackName = email.split("@")[0] || "Employer";
      const result = await authClient.signUp.email({
        email,
        password: formState.password,
        name: fallbackName,
      });

      if (result.error) {
        setErrorMsg(
          result.error.message || "Sign up failed. Please try again.",
        );
        return;
      }

      const hydrated = hydrateAuthStoreFromPayload(result);
      if (!hydrated) {
        await hydrateAuthStoreFromSession();
      }

      const user = useAuthStore.getState().user;
      if (user) {
        await hydrateCompanyIdFromUserId(user.id);
      }

      navigate("/company-setup");
    } catch {
      setErrorMsg("Sign up failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-[40vw] overflow-hidden">
          <div className="absolute left-[-41.4vmax] top-1/2 h-[82.8vmax] w-[82.8vmax] -translate-y-1/2 rounded-full">
            <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(248,156,30,0.36)_0%,rgba(248,156,30,0.10)_55%,rgba(248,156,30,0.00)_100%)] blur-2xl" />
          </div>
        </div>

        <div className="absolute inset-y-0 right-0 w-[40vw] overflow-hidden">
          <div className="absolute right-[-41.4vmax] top-1/2 h-[82.8vmax] w-[82.8vmax] -translate-y-1/2 rounded-full">
            <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.41)_0%,rgba(236,72,153,0.12)_55%,rgba(236,72,153,0.00)_100%)] blur-2xl" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-232 flex-col items-center pt-10 sm:pt-16">
        <img
          src={logo}
          alt="Jobby Employer"
          className="mb-8 h-auto w-75 sm:mb-10 sm:w-90"
        />

        <Card className="w-full max-w-140 rounded-2xl border border-border/80 bg-white/85 py-0 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <CardHeader className="px-7 pt-7 pb-4 sm:px-10">
            <CardTitle className="text-center text-[34px] font-normal tracking-tight text-foreground sm:text-[28px]">
              Add Company
            </CardTitle>
          </CardHeader>

          <CardContent className="px-7 pb-8 sm:px-10">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-email"
                  className="text-sm font-normal text-foreground/90"
                >
                  Email
                </label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="email"
                  autoComplete="email"
                  value={formState.email}
                  onChange={(event) => {
                    setFormState((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }));
                  }}
                  aria-invalid={Boolean(errors.email)}
                  className="h-11 rounded-lg bg-white"
                />
                {errors.email ? (
                  <p className="text-xs text-destructive">{errors.email}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="signup-password"
                  className="text-sm font-normal text-foreground/90"
                >
                  Password
                </label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="password"
                  autoComplete="new-password"
                  value={formState.password}
                  onChange={(event) => {
                    setFormState((previous) => ({
                      ...previous,
                      password: event.target.value,
                    }));
                  }}
                  aria-invalid={Boolean(errors.password)}
                  className="h-11 rounded-lg bg-white"
                />
                {errors.password ? (
                  <p className="text-xs text-destructive">{errors.password}</p>
                ) : null}
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="flex items-start gap-2 text-sm text-foreground/90">
                  <Checkbox
                    checked={formState.acceptedTerms}
                    onCheckedChange={(checked) => {
                      setFormState((previous) => ({
                        ...previous,
                        acceptedTerms: checked === true,
                      }));
                    }}
                    className="mt-0.5"
                    aria-invalid={Boolean(errors.acceptedTerms)}
                  />
                  <span>
                    Accept terms and condition
                    <span className="mt-1 block text-xs text-muted-foreground">
                      You agree to our Terms of Service and Privacy Policy.
                    </span>
                  </span>
                </label>
                {errors.acceptedTerms ? (
                  <p className="text-xs text-destructive">
                    {errors.acceptedTerms}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-center pt-1">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !isFormValid}
                  className="h-11 min-w-35 rounded-full px-8 text-base font-medium"
                >
                  {isSubmitting ? "Joining..." : "Join"}
                </Button>
              </div>

              {errorMsg ? (
                <p className="text-center text-sm text-destructive">
                  {errorMsg}
                </p>
              ) : null}

              <p className="pt-1 text-center text-xs text-muted-foreground">
                Already have an account?
                <button
                  type="button"
                  className="ml-1 text-foreground underline-offset-2 hover:underline"
                  onClick={() => navigate("/signin")}
                >
                  Sign in
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
