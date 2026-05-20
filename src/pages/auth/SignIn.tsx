import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import logo from "@/assets/icons/JobbyEmployer.png";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { SignInFormState } from "@/types/authSignUpTypes";
import {
  authClient,
  hydrateAuthStoreFromPayload,
  hydrateCompanyIdFromUserId,
  hydrateAuthStoreFromSession,
} from "@/services/authClient";
import { useAuthStore } from "@/store/auth";

const initialSignInFormState: SignInFormState = {
  email: "",
  password: "",
};

export default function SignInPage() {
  const [signInFormState, setSignInFormState] = useState<SignInFormState>(
    initialSignInFormState,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSignInSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg("");
    setIsLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: signInFormState.email.trim(),
        password: signInFormState.password,
      });

      if (result.error) {
        setErrorMsg(
          result.error.message ||
            "Sign in failed. Please check your credentials.",
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
        navigate("/profile");
        return;
      }

      setErrorMsg("Sign in failed. Please check your credentials.");
    } catch {
      setErrorMsg("Sign in failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
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
              Welcome Employer
            </CardTitle>
          </CardHeader>

          <CardContent className="px-7 pb-8 sm:px-10">
            <form className="space-y-4" onSubmit={handleSignInSubmit}>
              <div className="space-y-1.5">
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="email"
                  autoComplete="email"
                  value={signInFormState.email}
                  onChange={(event) => {
                    setSignInFormState((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }));
                  }}
                  className="h-11 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="password"
                  autoComplete="current-password"
                  value={signInFormState.password}
                  onChange={(event) => {
                    setSignInFormState((previous) => ({
                      ...previous,
                      password: event.target.value,
                    }));
                  }}
                  className="h-11 rounded-lg bg-white"
                />
                <p className="text-right text-xs text-muted-foreground">
                  forget password?
                </p>
              </div>

              <div className="flex items-center justify-center pt-1">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="h-11 min-w-35 rounded-full px-8 text-base font-medium"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>

              {errorMsg && (
                <p className="text-center text-sm text-destructive">
                  {errorMsg}
                </p>
              )}

              <p className="pt-1 text-center text-xs text-foreground">
                New Company?
                <button
                  type="button"
                  className="ml-1 font-medium text-[#ff6b40] underline-offset-2 hover:underline"
                  onClick={() => navigate("/signup")}
                >
                  Create account
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
