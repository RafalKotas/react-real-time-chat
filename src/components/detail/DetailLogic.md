# Detail

Component to display chat details, like: chat options, shared photos, shared files, privacy settings etc.

## Props

No props included.

## useState variables:

- `const [isBlockButtonHovered, setIsBlockButtonHovered] = useState(false);`

`isBlockButtonHovered` - flag to determine whether block button is hovered (displaying proper label and changing styles)

### Usage in component's code:

```typescript
const blockButtonClass = () => {
    if (isCurrentUserBlocked) {
        return "blocked-current-user";
    } else if (isReceiverBlocked) {
        if (isBlockButtonHovered) {
            return "blocked-receiver-hovered";
        }
        return "blocked-receiver";
    }

    if (!isReceiverBlocked && !isCurrentUserBlocked) {
        if (isBlockButtonHovered) {
            return "block-user-hovered";
        }
        return "block-user";
    }

    return "";
}

const blockButtonText = () => {
    if (isCurrentUserBlocked) {
        return <>
            <FontAwesomeIcon icon={faWarning} /> 
            <span>YOU ARE BLOCKED BY THIS USER!</span>
        </>;
    } else if (isReceiverBlocked) {
        if (isBlockButtonHovered) {
            return <>
                <FontAwesomeIcon icon={faLockOpen} />&nbsp;
                <span>UNBLOCK USER</span>
            </>;
        }
        return <>
        <FontAwesomeIcon icon={faLock} />&nbsp;
            <span>USER BLOCKED BY YOU!</span>
        </>;
    }

    if (!isReceiverBlocked && !isCurrentUserBlocked) {
        return <>
            {isBlockButtonHovered ? <FontAwesomeIcon icon={faLock} /> : <FontAwesomeIcon icon={faLockOpen} />}&nbsp;
            <span>BLOCK USER</span>
        </>
    }

    return "";
}
```

Determines:
1. Class for block user button
2. Text on block user button

- `const [currentSection, setCurrentSection] = useState<CurrentSection>("chat-settings");`

`currentSection` - used to determine which section is currently opened:

`type CurrentSection = "chat-settings" | "privacy-help" | "shared-photos" | "shared-files" | "";`

### Usage in component's code:

```typescript
const handleSectionClick = (section: CurrentSection) => {
    if (currentSection === section) {
        setCurrentSection("");
    }
    setCurrentSection(section);
}
```

Sets current section if differs from earlier or sets it to empty string (close) if `section` argument is equal to `currentSection`.

```html
<div className="option chat-settings">
    <div className="title">
        <span>Chat Settings</span>
        <FontAwesomeIcon 
            icon={currentSection === "chat-settings" ? faArrowUp : faArrowDown} 
            onClick={() => handleSectionClick(currentSection === "chat-settings" ? "" : "chat-settings")} 
        />
    </div>
</div>
<div className="option privacy-help">
    <div className="title">
        <span>Privacy & help</span>
        <FontAwesomeIcon 
            icon={currentSection === "privacy-help" ? faArrowUp : faArrowDown} 
            onClick={() => handleSectionClick(currentSection === "privacy-help" ? "" : "privacy-help")} 
        />
    </div>
</div>
<div className="option">
    <div className="title">
        <span>Shared photos</span>
            <FontAwesomeIcon 
                icon={currentSection === "shared-photos" ? faArrowUp : faArrowDown} 
                onClick={() => handleSectionClick(currentSection === "shared-photos" ? "" : "shared-photos")} 
        />
    </div>
    {currentSection === "shared-photos" && <div className="photos">
        {isCurrentUserBlocked ? <div><img style={{ width: "100%", height: "100%" }} src="/shared-photos-blocked.png" alt="" /></div> : chatImages.map((imageUrl, index) => (
            <div className="photoItem" onClick={() => handlePhotoClick(index)}>
                <div className="photoDetail">
                    <img src={imageUrl} alt="" />
                </div>
            </div>
        ))}
    </div>}
</div>
<div className="option shared-files">
    <div className="title">
        <span>Shared Files</span>
        <FontAwesomeIcon 
            icon={faArrowDown} 
            onClick={() => handleSectionClick(currentSection === "shared-files" ? "" : "shared-files")} 
        />
    </div>
</div>
```

1. Renders `faArrowUp` / `faArrowDown` `FontAwesomeIcon` depending on `currentSection` value.
2. Changes `currentSection` on `FontAwesomeIcon` click.

- `const [galleryMode, setGalleryMode] = useState<boolean>(false);`

`galleryMode` - flag to determine whether gallery is opened (sth like images slideshow)

### Usage in component's code

```typescript
const handlePhotoClick = (index: number) => {
    if (isCurrentUserBlocked) return;

    if (!galleryMode) {
        setGalleryMode(true);
        setInitialGalleryImageIndex(index);
    }
}
```

Sets `galleryMode` to `true`.

```html
{galleryMode && <Gallery 
    setGalleryMode={setGalleryMode} 
    chatImages={chatImages}
    initialGalleryImageIndex={initialGalleryImageIndex || 0}
/>}
```

displays `Gallery` component if `galleryMode` is set to `true`.

- `const [initialGalleryImageIndex, setInitialGalleryImageIndex] = useState<number | null>(null);`

`initialGalleryImageIndex` - index of image displayed first after gallery is rendered

### Usage in component's code

```html
{galleryMode && <Gallery 
    setGalleryMode={setGalleryMode} 
    chatImages={chatImages}
    initialGalleryImageIndex={initialGalleryImageIndex || 0}
/>}
```

Initialize `Gallery` component with `initialGalleryImageIndex` depending on which image is clicked.

## Business logic

### `useEffect's`

```typescript
useEffect(() => {
    if (!isCurrentUserBlocked || !blockedByUserId || !currentUser?.id) return;

    const unsubscribe = onSnapshot(doc(db, "users", blockedByUserId), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as Omit<UserData, "id">;
        const blocked = data.blocked ?? [];
        if (!blocked.includes(currentUser.id)) {
            updateChatUser({ ...data, id: snap.id } as UserData);
        }
    });

    return () => unsubscribe();
}, [isCurrentUserBlocked, blockedByUserId, currentUser?.id, updateChatUser]);
```

If all of these conditions are met:
1. Current user is not blocked by chat partner,
2. Chat partner is not blocked by current user,
3. We don't have current user's id,

We do nothing. Otherwise:
Subscription to the `"users"` collection with chat partner ids is started.
If `currentUser.id` is not in `blocked`, it means that chat partner unblocked you.
Then `updateChatUser(...)` is called and blocked information is updated.
When the effect dependencies change, or component unmounts, returned function unsubscribes from the listener.

## Functions

```typescript
const handleSectionClick = (section: CurrentSection) => {
    if (currentSection === section) {
        setCurrentSection("");
    }
    setCurrentSection(section);
}
```

Sets `currentSection` value from `section` argument with which method is called.

```typescript
const handlePhotoClick = (index: number) => {
    if (isCurrentUserBlocked) return;

    if (!galleryMode) {
        setGalleryMode(true);
        setInitialGalleryImageIndex(index);
    }
}
```

If current user is blocked, does nothing. Otherwise opens gallery with initial clicked image.

```typescript
const handleBlockUser = async () => {
    if (!user || !currentUser?.id) return;

    const currentUserDocRef = doc(db, "users", currentUser.id);

    try {
        await updateDoc(currentUserDocRef, {
            blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
        });
        changeBlock();
        await fetchUser(currentUser.id);
    } catch (error) {
        console.error(error);
    }
}
```

Updates `currentUser.id` doc from `"users"` collection.
Adds (`arrayUnion(user.id)`) or removes (`arrayRemove(user.id)`) depending of `user.id` presence in `blocked` list of `currentUser`.


## Component's code
```html
return chatId ? (
    <div className='detail'>
        <div className="user">
            <div className="user-info">
                <img src={user?.avatar || "./user.png"} alt="" />
                <h2>{user?.username}</h2>
            </div>

            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        </div>
        <div className="info">
            <div className="option chat-settings">
                <div className="title">
                    <span>Chat Settings</span>
                    <FontAwesomeIcon 
                        icon={currentSection === "chat-settings" ? faArrowUp : faArrowDown} 
                        onClick={() => handleSectionClick(currentSection === "chat-settings" ? "" : "chat-settings")} 
                    />
                </div>
            </div>
            <div className="option privacy-help">
                <div className="title">
                    <span>Privacy & help</span>
                    <FontAwesomeIcon 
                        icon={currentSection === "privacy-help" ? faArrowUp : faArrowDown} 
                        onClick={() => handleSectionClick(currentSection === "privacy-help" ? "" : "privacy-help")} 
                    />
                </div>
            </div>
            <div className="option">
                <div className="title">
                    <span>Shared photos</span>
                    <FontAwesomeIcon 
                        icon={currentSection === "shared-photos" ? faArrowUp : faArrowDown} 
                        onClick={() => handleSectionClick(currentSection === "shared-photos" ? "" : "shared-photos")} 
                    />
                </div>
                {currentSection === "shared-photos" && <div className="photos">
                    {isCurrentUserBlocked ? <div><img style={{ width: "100%", height: "100%" }} src="/shared-photos-blocked.png" alt="" /></div> : chatImages.map((imageUrl, index) => (
                        <div className="photoItem" onClick={() => handlePhotoClick(index)}>
                            <div className="photoDetail">
                                <img src={imageUrl} alt="" />
                            </div>
                        </div>
                    ))}
                </div>}
            </div>
            <div className="option shared-files">
                <div className="title">
                    <span>Shared Files</span>
                    <FontAwesomeIcon 
                        icon={faArrowDown} 
                        onClick={() => handleSectionClick(currentSection === "shared-files" ? "" : "shared-files")} 
                    />
                </div>
            </div>
            <div className="detail-buttons-container">
                <button
                    className={`${blockButtonClass()}`}
                    onClick={handleBlockUser}
                    disabled={isCurrentUserBlocked}
                    onMouseEnter={() => {
                        setIsBlockButtonHovered(true);
                    }}
                    onMouseLeave={() => {
                        setIsBlockButtonHovered(false);
                    }}
                >
                    {blockButtonText()}
                </button>
                <button className="logout" onClick={() => auth.signOut()}>
                    <FontAwesomeIcon icon={faArrowRightFromBracket} /> Logout
                </button>
            </div>
        </div>
        {galleryMode && <Gallery 
            setGalleryMode={setGalleryMode} 
            chatImages={chatImages}
            initialGalleryImageIndex={initialGalleryImageIndex || 0}
        />}
    </div>
) : (
    <div>No chat selected</div>
)
```


