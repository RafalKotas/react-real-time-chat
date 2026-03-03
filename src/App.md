# App

## Props

No props included.

## `useState` variables

No `useState` variables included.

## Zustand store properties

### userStore
- `user: currentUser`

#### Usages in component
```typescript
{
currentUser ? (
    <>
        <List/>
        {chatId && <Chat/>}
        {chatId && <Detail/>}
    </>
    ) : (
    <Login />
)}
```

If `currentUser` is set, render user UI with chatList, chat window and chat details component.
In other case render `Login` component.

- `isLoading`

#### Usages in component
```typescript
if (isLoading) return <div className="loading">Loading...</div>;
```

While `isLoading` is `true`, only render div with `Loading...` text in the screen center.

- `fetchUser`

Gets user data when firebase `auth` variable changes (user is set).

#### Usages in component
```typescript
useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchUser(user?.uid || "");
    });
    return () => unsubscribe();
}, [fetchUser]);
```

### chatStore
- `chatId`

Checks if any `chatId` is set inside chat store state.

#### Usages in component
```html
<>
    <List/>
    {chatId && <Chat/>}
    {chatId && <Detail/>}
</>
```

## Business logic

### `useEffect`'s

```typescript
useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        fetchUser(user?.uid || "");
    });
    return () => unsubscribe();
}, [fetchUser]);
```

After `auth` variable value/s change, fetching user data to display around application components.

## Component's code
```html
<div className='container'>
    { 
        currentUser ? (
          <>
            <List/>
            {chatId && <Chat/>}
            {chatId && <Detail/>}
          </>
    ) : (
        <Login />
    )}
    <Notification />
</div>
```