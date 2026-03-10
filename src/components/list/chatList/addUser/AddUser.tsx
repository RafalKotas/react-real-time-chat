import "./addUser.css";
import type { UserData } from "@lib/userStore";
import { useUserStore } from "@lib/userStore";
import { useState } from "react";
import { searchByUsername } from "@lib/api/users";
import { createChat } from "@lib/api/chats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const AddUser = ({
  setAddMode,
  onAdded,
}: {
  setAddMode: (addMode: boolean) => void;
  onAdded?: () => void;
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [searching, setSearching] = useState(false);

  const { user: currentUser } = useUserStore();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = (formData.get("username") as string)?.trim();
    if (!username) return;

    setSearching(true);
    setUser(null);
    try {
      const list = await searchByUsername(username);
      if (list.length > 0) {
        const u = list[0];
        setUser({
          id: u.id,
          username: u.username ?? "",
          email: u.email,
          avatar: u.avatar,
          blocked: u.blocked ?? [],
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddUser = async () => {
    if (!user?.id || !currentUser?.id) return;

    try {
      await createChat(user.id);
      setAddMode(false);
      await onAdded?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create chat";
      if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("exist")) {
        toast.warning("Chat already exists");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="addUser">
      <div className="add-user-header">
        <div className="header-title">
          <span>Search for a user</span>&nbsp;
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </div>
        <FontAwesomeIcon
          className="add-user-close"
          icon={faXmark}
          onClick={() => setAddMode(false)}
        />
      </div>
      <form onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="Username"
          name="username"
        />
        <button type="submit" disabled={searching}>
          {searching ? "Searching..." : "Search"}
        </button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./user.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAddUser}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
