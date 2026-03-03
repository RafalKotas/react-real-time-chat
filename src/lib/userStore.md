# userStore

## interface `UserData`

```typescript
export interface UserData {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    blocked: string[];
    createdAt: unknown;
    updatedAt: unknown;
}
```

### interface `UserData` - properties

`id` - current identifactor from firestore `"users"` document

`username` - username for user with `id`

`email` - current user email, provided during sign up

`avatar` - url to current user' image file

`blocked` - list of ids users blocked by current user

`createdAt` - current user creation timestamp

`updatedAt` - current user update timestamp

## interface `UserStore`

```typescript
interface UserStore {
    user: UserData | null;
    isLoading: boolean;
    fetchUser: (uuid: string) => Promise<void>;
}
```

### interface `UserStore` - properties

`user` - user data described above (`UserData` type)

`isLoading` - flag to determine whether user data is loading

`fetchUser` - function to pass user data to store

**Steps**:
1. if no uuid, set user to null and loading to false

*try*

2. get user document reference
3. get user document snapshot
4. if document exists, go to 5., else go to 7.
5. create user with id
6. set user to store
7. if document does not exist, set user to null and loading to false

*catch*

8. if error, set user to null and loading to false
9. return user to null and loading to false