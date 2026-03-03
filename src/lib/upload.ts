import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import type { UploadTask, UploadTaskSnapshot } from "firebase/storage";
import { storage } from "./firebase";

const uploadFile = async (file: File) => {

    const timestamp = new Date();
    const timestampUnique = timestamp.getMinutes() + ":" + timestamp.getSeconds() + ":" + timestamp.getMilliseconds();
    const storageRef = ref(storage, `images/${timestampUnique + file.name}`);

    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

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
}

export default uploadFile;