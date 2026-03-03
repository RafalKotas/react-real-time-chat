# Login - business logic and explanations

## useState values:
 
```javascript
const [signInLoading, setSignInLoading] = useState(false);
```
Disables **Login** inputs if true.
Button for signUp label:
- "Signing In..." if `signUpLoading = true`
- "Sign In" if `signUpLoading = false`
--- 
<br>

```javascript
const [signUpLoading, setSignUpLoading] = useState(false);
```
Disables **Register** inputs if true.
Button for signUp label:
- "Creating Account..." if `signUpLoading = true`
- "SignUp" if `signUpLoading = false`
---
<br>

```javascript
const [avatar, setAvatar] = useState<AvatarState>({
        file: null,
        url: undefined
});
```
Selected in SignUp input image data:
```html
<input disabled={signUpLoading} type="file" id="file" style={{ display: "none" }} onChange={handleAvatarChange}/>
```

## Functions:

### handleAvatarChange

```javascript
const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar({ file: file, url: URL.createObjectURL(file) });
        }
    };
```

If `e.target.files` is not null, get first value from this array and set avatar data to this file attributes.

### handleLogin

```javascript
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
```

1. Sets `useState` `signInLoading` variable to `true`
2. Extracts `email` and `password` from form
3. Try to sign in with firebase function `signInWithEmailAndPassword` help with given credentials.
4. If error occurs, displays this error message on the toast (`"react-toastify"`).
5. Finally sets `useState` `signInLoading` variable to `false`

### handleSignUp

```javascript
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
```

1. Sets `useState` `signUpLoading` variable to `true`
2. Extracts `username`, `email` and `password` from form
3. Trims `email` and `password`
4. If `email` or/and `password` not filled, displays toast with error and sets `useState` `signUpLoading` variable to `false`. In other case 5.
5. Try to sign up with firebase function `createUserWithEmailAndPassword` help with given credentials. 
6. Uploads avatarFile with help from `firebase/storage` functions.
7. Sets firebase docs initial values:
- `"users"`
- `"userchats"`
8. If everything executed without errors, displays success toast. In other case 9.
9. Displays error toast.
10. Finally sets `useState` `signUpLoading` variable to `false`