# upload (image to Firebase Storage)

## variables

`const timestamp = new Date();` - timestamp for uploaded file (image)

`const timestampUnique = timestamp.getMinutes() + ":" + timestamp.getSeconds() + ":" + timestamp.getMilliseconds();` - unique (or nearly unique) timestamp value to prevent identical file name (Firebase Storage) when `file` parameter name has same value across different function calls

`const storageRef = ref(storage, `images/${timestampUnique + file.name}`);` - Storae reference for the given url (timestamp concatenated with fileName)

## business logic

```typescript
    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot: UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
            },
            (error: unknown) => {
                reject("Error uploading file: " + (error instanceof Error ? error.message : String(error)));
            },
            () => {
                getDownloadURL(storageRef).then((url) => {
                    resolve(url);
                });
            }
        );
    });
```

### Steps:

1. **Creates a Promise** that wraps the Firebase `uploadTask` so callers can `await` the upload and get the final download URL or an error.
2. **Subscribes to `uploadTask`** via `uploadTask.on("state_changed", ...)` with three callbacks: progress, error, and completion.
3. **Progress callback** (second argument): On each state change, computes `progress = (bytesTransferred / totalBytes) * 100` and logs it; the Promise is not settled here.
4. **Error callback** (third argument): On upload failure, rejects the Promise with a message like `"Error uploading file: " + error.message` (or stringified error).
5. **Completion callback** (fourth argument): When the upload finishes successfully, calls `getDownloadURL(storageRef)` to get the public URL of the stored file, then **resolves** the Promise with that URL.
6. The function returns this Promise, so `uploadFile(file)` resolves to the download URL string or rejects with the error message.