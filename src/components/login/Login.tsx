import { toast } from "react-toastify";
import "./login.css"
import { useState } from "react";
import type { SubmitEvent, ChangeEvent } from "react";

type AvatarState = {
    file: File | null;
    url: string | undefined;
};

const Login = () => {

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

    const handleLogin = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Hello world clicked button");
        toast.warn("Hello")
    };
    return (
        <div className="login">
            <div className="item">
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button>Sign In</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form>
                    <label htmlFor="file">
                        <img id="avatar-upload-placeholder" src={avatar.url || "./Letter-A-icon.png"} alt="Avatar" />
                        Upload an Image
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatarChange}/>
                    <input type="text" placeholder="Username" name="username"/>
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button>Sign In</button>
                </form>
            </div>
        </div>
    )
}

export default Login