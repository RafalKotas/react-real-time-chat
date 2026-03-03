import "./addUser.css"
import { db } from "../../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { UserData } from "../../../../lib/userStore";
import { useUserStore } from "../../../../lib/userStore";
import { useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";


const AddUser = ({setAddMode}: {setAddMode: (addMode: boolean) => void}) => {

    const [user, setUser] = useState<UserData | null>(null);

    const {user: currentUser} = useUserStore();

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const username = formData.get("username") as string;

        try {
            const userRef = collection(db, "users");

            const q = query(userRef, where("username", "==", username));

            const querySnapshot = await getDocs(q);

            if(!querySnapshot.empty) {
                const user = querySnapshot.docs[0].data() as UserData;
                setUser(user);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const addChatToUserchats = async (
        userId: string,
        receiverId: string,
        chatId: string
    ) => {
        const newChatEntry = {
            chatId,
            lastMessageId: "",
            receiverId,
            updatedAt: Date.now(),
        };
        const userchatsRef = doc(db, "userchats", userId);
        const snap = await getDoc(userchatsRef);
        if (snap.exists()) {
            await updateDoc(userchatsRef, {
                chats: arrayUnion(newChatEntry),
            });
        } else {
            await setDoc(userchatsRef, { chats: [newChatEntry] });
        }
    };

    const handleAddUser = async () => {
        if (!user?.id || !currentUser?.id) return;

        try {
            const currentUserchatsRef = doc(db, "userchats", currentUser.id);
            const currentUserchatsSnap = await getDoc(currentUserchatsRef);
            const existingChats = (currentUserchatsSnap.data()?.chats ?? []) as { receiverId?: string }[];
            const chatExists = existingChats.some(
                (chat) => chat.receiverId != null && chat.receiverId === user.id
            );

            if (chatExists) {
                toast.warning("Chat already exists");
                setAddMode(false);
                return;
            }

            const chatRef = collection(db, "chats");
            const newChatRef = doc(chatRef);

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await addChatToUserchats(user.id, currentUser.id, newChatRef.id);
            await addChatToUserchats(currentUser.id, user.id, newChatRef.id);
            setAddMode(false);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="addUser">
            <div className="add-user-header">
                <div className="header-title">
                    <span>Search for a user</span>&nbsp;
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </div>
                <FontAwesomeIcon className="add-user-close" icon={faXmark} onClick={() => setAddMode(false)} />
            </div>
            <form onSubmit={handleSearch}>
                <input className="search-input" type="text" placeholder="Username" name="username"/>
                <button>Search</button>
            </form>
            {user && <div className="user">
                <div className="detail">
                    <img src={user.avatar || "./user.png"} alt="" />
                    <span>{user.username}</span>
                </div>
                <button onClick={handleAddUser}>Add User</button>
            </div>}
        </div>
    )
}

export default AddUser;