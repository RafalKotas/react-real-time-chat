import { toast } from "react-toastify";
import "./login.css";
import { useState } from "react";
import type { SubmitEvent, ChangeEvent } from "react";
import { login, register, mapApiUserToUserData } from "../../lib/api";
import { useUserStore } from "../../lib/userStore";
import uploadFile from "../../lib/upload";

type AvatarState = {
  file: File | null;
  url: string | undefined;
};

const Login = () => {
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);

  const [avatar, setAvatar] = useState<AvatarState>({
    file: null,
    url: undefined,
  });

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar({ file, url: URL.createObjectURL(file) });
    }
  };

  const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignInLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = (formData.get("email") as string)?.trim() ?? "";
    const password = (formData.get("password") as string)?.trim() ?? "";

    try {
      const res = await login(email, password);
      useUserStore.setState({ user: mapApiUserToUserData(res.user), isLoading: false });
      toast.success("Signed in successfully!!!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignUpLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const username = (formData.get("username") as string)?.trim() ?? "";
    const email = (formData.get("email") as string)?.trim() ?? "";
    const password = (formData.get("password") as string)?.trim() ?? "";

    if (!email || !password) {
      toast.error("Email and password are required.");
      setSignUpLoading(false);
      return;
    }

    try {
      const avatarUrl = avatar.file
        ? ((await uploadFile(avatar.file)) as string)
        : undefined;

      const res = await register({
        email,
        password,
        username,
        avatarUrl,
      });

      useUserStore.setState({ user: mapApiUserToUserData(res.user), isLoading: false });
      toast.success("Account created successfully!!!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
          <input disabled={signInLoading} type="text" placeholder="Email" name="email" />
          <input disabled={signInLoading} type="password" placeholder="Password" name="password" />
          <button disabled={signInLoading}>
            {signInLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleSignUp}>
          <label htmlFor="file">
            <img
              id="avatar-upload-placeholder"
              src={avatar.url || "./user.png"}
              alt="Avatar"
            />
            Upload an Image
          </label>
          <input
            disabled={signUpLoading}
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <input
            disabled={signUpLoading}
            type="text"
            placeholder="Email"
            name="email"
            autoComplete="email"
          />
          <input
            disabled={signUpLoading}
            type="text"
            placeholder="Username"
            name="username"
            autoComplete="username"
          />
          <input
            disabled={signUpLoading}
            type="password"
            placeholder="Password"
            name="password"
            autoComplete="new-password"
          />
          <button disabled={signUpLoading}>
            {signUpLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
