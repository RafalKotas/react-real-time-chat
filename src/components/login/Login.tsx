import { toast } from "react-toastify";
import "./login.css"
import { useState } from "react";
import type { SubmitEvent, ChangeEvent } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { setDoc, doc } from "firebase/firestore";
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
        url: undefined
    });

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar({ file: file, url: URL.createObjectURL(file) });
        }
    };

    const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        setSignInLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);

        const { email, password } = Object.fromEntries(formData);

        try {
            await signInWithEmailAndPassword(auth, email as string, password as string);
            toast.success("Signed in successfully!!!");
        } catch (error) {
            console.error(error);
            toast.error((error as Error).message);
        } finally {
            setSignInLoading(false);
        }
    };


    const handleSignUp = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSignUpLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);

        const { username, email, password } = Object.fromEntries(formData);
        const emailTrimmed = (email as string)?.trim() ?? "";
        const passwordTrimmed = (password as string)?.trim() ?? "";

        if (!emailTrimmed || !passwordTrimmed) {
            toast.error("Email and password are required.");
            setSignUpLoading(false);
            return;
        }

        try {

            const res = await createUserWithEmailAndPassword(auth, emailTrimmed, passwordTrimmed);

            const avatarUrl = await uploadFile(avatar.file as File);

            const userId = res.user.uid;

            await setDoc(doc(db, "users", userId), {
                username: (username as string)?.trim() ?? "",
                email: emailTrimmed,
                avatar: avatarUrl,
                id: userId,
                blocked: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await setDoc(doc(db, "userchats", userId), {
                chats: [],
            });

            toast.success("Account created successfully!!!");
        } catch (error) {
            console.error(error);
            toast.error((error as Error).message);
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
                    <button disabled={signInLoading}>{signInLoading ? "Signing In..." : "Sign In"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleSignUp}>
                    <label htmlFor="file">
                        <img id="avatar-upload-placeholder" src={avatar.url || "./user.png"} alt="Avatar" />
                        Upload an Image
                    </label>
                    <input disabled={signUpLoading} type="file" id="file" style={{ display: "none" }} onChange={handleAvatarChange}/>
                    <input disabled={signUpLoading} type="text" placeholder="Email" name="email" autoComplete="email" />
                    <input disabled={signUpLoading} type="text" placeholder="Username" name="username" autoComplete="username" />
                    <input disabled={signUpLoading} type="password" placeholder="Password" name="password" autoComplete="new-password" />
                    <button disabled={signUpLoading}>{signUpLoading ? "Creating Account..." : "Sign Up"}</button>
                </form>
            </div>
        </div>
    )
}

export default Login