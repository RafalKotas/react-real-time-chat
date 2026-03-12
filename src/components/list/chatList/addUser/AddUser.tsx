import { useState, useEffect, type SubmitEvent } from "react";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";

import "./addUser.css";

import { createChat } from "@lib/api/chats";
import {
  acceptContact,
  getContactStatus,
  getContacts,
  rejectContact,
  sendContactRequest,
} from "@lib/api/contacts";
import { searchByUsername } from "@lib/api/users";
import type { ApiContactStatus } from "@lib/api/types";
import { useChatStore } from "@lib/chatStore";
import { useUserStore } from "@lib/userStore";
import type { UserData } from "@lib/userStore";

const AddUser = ({
  setAddMode,
  onAdded,
}: {
  setAddMode: (addMode: boolean) => void;
  onAdded?: () => void;
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [searching, setSearching] = useState(false);
  const [contactStatus, setContactStatus] = useState<ApiContactStatus | null>(null);
  const [contactStatusLoading, setContactStatusLoading] = useState(false);
  const [pendingContactId, setPendingContactId] = useState<string | null>(null);
  const [contactBusy, setContactBusy] = useState(false);

  const { user: currentUser } = useUserStore();
  const { receiverIdsWithChat, addReceiverId } = useChatStore();

  useEffect(() => {
    if (!user?.id || !currentUser?.id) {
      setContactStatus(null);
      setContactStatusLoading(false);
      setPendingContactId(null);
      return;
    }
    let cancelled = false;
    setContactStatusLoading(true);
    getContactStatus(user.id)
      .then((status) => {
        if (!cancelled) setContactStatus(status);
      })
      .catch(() => {
        if (!cancelled) setContactStatus(null);
      })
      .finally(() => {
        if (!cancelled) setContactStatusLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, currentUser?.id]);

  useEffect(() => {
    if (!user?.id || !currentUser?.id || contactStatus?.contactState !== "pending_received") {
      setPendingContactId(null);
      return;
    }
    let cancelled = false;
    getContacts("pending_received").then((list) => {
      if (cancelled) return;
      const c = list.find((x) => x.requestSenderId === user.id);
      setPendingContactId(c?.id ?? null);
    }).catch(() => {
      if (!cancelled) setPendingContactId(null);
    });
    return () => { cancelled = true; };
  }, [user?.id, currentUser?.id, contactStatus?.contactState]);

  const handleSearch = async (e: SubmitEvent<HTMLFormElement>) => {
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

  const handleAddToChat = async () => {
    if (!user?.id || !currentUser?.id) return;

    try {
      await createChat(user.id);
      addReceiverId(user.id);
      setAddMode(false);
      onAdded?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create chat";
      if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("exist")) {
        toast.warning("Chat already exists");
      } else {
        toast.error(msg);
      }
    }
  };

  const handleAddContact = async () => {
    if (!user?.id || contactBusy) return;
    setContactBusy(true);
    try {
      await sendContactRequest(user.id);
      const status = await getContactStatus(user.id);
      setContactStatus(status);
      toast.success("Contact request sent");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send request";
      toast.error(msg);
    } finally {
      setContactBusy(false);
    }
  };

  const handleAcceptContact = async () => {
    if (!pendingContactId || contactBusy) return;
    setContactBusy(true);
    try {
      await acceptContact(pendingContactId);
      const status = await getContactStatus(user!.id);
      setContactStatus(status);
      setPendingContactId(null);
      toast.success("Contact accepted");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to accept";
      toast.error(msg);
    } finally {
      setContactBusy(false);
    }
  };

  const handleRejectContact = async () => {
    if (!pendingContactId || contactBusy) return;
    setContactBusy(true);
    try {
      await rejectContact(pendingContactId);
      const status = await getContactStatus(user!.id);
      setContactStatus(status);
      setPendingContactId(null);
      toast.success("Request rejected");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject";
      toast.error(msg);
    } finally {
      setContactBusy(false);
    }
  };

  const renderContactBlock = () => {
    if (contactStatusLoading) {
      return <div className="add-user-contact-state">Loading…</div>;
    }
    if (!contactStatus) return null;
    const state = contactStatus.contactState;
    if (state === "none") {
      return (
        <button
          type="button"
          className="add-user-contact-action"
          onClick={handleAddContact}
          disabled={contactBusy}
        >
          Add contact
        </button>
      );
    }
    if (state === "pending_sent") {
      return <div className="add-user-contact-state">Pending</div>;
    }
    if (state === "pending_received" && pendingContactId) {
      return (
        <div className="add-user-contact-buttons">
          <button type="button" onClick={handleAcceptContact} disabled={contactBusy}>
            Accept
          </button>
          <button type="button" onClick={handleRejectContact} disabled={contactBusy}>
            Reject
          </button>
        </div>
      );
    }
    if (state === "pending_received") {
      return <div className="add-user-contact-state">Pending</div>;
    }
    if (state === "accepted") {
      return <div className="add-user-contact-state">Contact 😊</div>;
    }
    if (state === "rejected") {
      return <div className="add-user-contact-state">Rejected</div>;
    }
    return null;
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
          <div className="add-user-actions">
            {!receiverIdsWithChat.includes(user.id) && (
              <button type="button" className="add-user-to-chat" onClick={handleAddToChat}>
                Add to chat
              </button>
            )}
            {renderContactBlock()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
