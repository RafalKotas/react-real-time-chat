import "./detail.css";
import {
  faArrowDown,
  faArrowRightFromBracket,
  faArrowUp,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatStore } from "@lib/chatStore";
import { useUserStore } from "@lib/userStore";
import { updateBlocked } from "@lib/api/users";
import { logout } from "@lib/api/auth";
import { useEffect, useState } from "react";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import Gallery from "@components/detail/gallery/Gallery";
import { getUser } from "@lib/api/users";
import { mapApiUserToUserData } from "@lib/api/auth";

type CurrentSection =
  | "chat-settings"
  | "privacy-help"
  | "shared-photos"
  | "shared-files"
  | "";

const DETAIL_POLL_MS = 2500;

const Detail = () => {
  const {
    chatId,
    user,
    isReceiverBlocked,
    isCurrentUserBlocked,
    changeBlock,
    chatImages,
    updateChatUser,
  } = useChatStore();
  const { user: currentUser, fetchUser } = useUserStore();
  const [isBlockButtonHovered, setIsBlockButtonHovered] = useState(false);
  const [currentSection, setCurrentSection] = useState<CurrentSection>("chat-settings");
  const [galleryMode, setGalleryMode] = useState<boolean>(false);
  const [initialGalleryImageIndex, setInitialGalleryImageIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchPartner = async () => {
      const apiUser = await getUser(user.id);
      if (apiUser) {
        updateChatUser(mapApiUserToUserData(apiUser));
      }
    };
    fetchPartner();
    const interval = setInterval(fetchPartner, DETAIL_POLL_MS);
    return () => clearInterval(interval);
  }, [user?.id, updateChatUser]);

  const handleSectionClick = (section: CurrentSection) => {
    if (currentSection === section) {
      setCurrentSection("");
    } else {
      setCurrentSection(section);
    }
  };

  const handlePhotoClick = (index: number) => {
    if (isCurrentUserBlocked) return;
    if (!galleryMode) {
      setGalleryMode(true);
      setInitialGalleryImageIndex(index);
    }
  };

  const handleBlockUser = async () => {
    if (!user || !currentUser?.id) return;

    try {
      const updated = await updateBlocked(user.id, !isReceiverBlocked);
      useUserStore.setState({ user: mapApiUserToUserData(updated) });
      changeBlock();
      const apiUser = await getUser(user.id);
      if (apiUser) {
        updateChatUser(mapApiUserToUserData(apiUser));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    useUserStore.setState({ user: null });
    useChatStore.getState().resetChat();
  };

  const blockButtonClass = () => {
    if (isCurrentUserBlocked) {
      return "blocked-current-user";
    }
    if (isReceiverBlocked) {
      return isBlockButtonHovered ? "blocked-receiver-hovered" : "blocked-receiver";
    }
    if (!isReceiverBlocked && !isCurrentUserBlocked) {
      return isBlockButtonHovered ? "block-user-hovered" : "block-user";
    }
    return "";
  };

  const blockButtonText = () => {
    if (isCurrentUserBlocked) {
      return (
        <>
          <FontAwesomeIcon icon={faWarning} />
          <span>YOU ARE BLOCKED BY THIS USER!</span>
        </>
      );
    }
    if (isReceiverBlocked) {
      if (isBlockButtonHovered) {
        return (
          <>
            <FontAwesomeIcon icon={faLockOpen} />&nbsp;
            <span>UNBLOCK USER</span>
          </>
        );
      }
      return (
        <>
          <FontAwesomeIcon icon={faLock} />&nbsp;
          <span>USER BLOCKED BY YOU!</span>
        </>
      );
    }
    if (!isReceiverBlocked && !isCurrentUserBlocked) {
      return (
        <>
          {isBlockButtonHovered ? (
            <FontAwesomeIcon icon={faLock} />
          ) : (
            <FontAwesomeIcon icon={faLockOpen} />
          )}
          &nbsp;
          <span>BLOCK USER</span>
        </>
      );
    }
    return "";
  };

  return chatId ? (
    <div className="detail">
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
              onClick={() =>
                handleSectionClick(
                  currentSection === "chat-settings" ? "" : "chat-settings"
                )
              }
            />
          </div>
        </div>
        <div className="option privacy-help">
          <div className="title">
            <span>Privacy & help</span>
            <FontAwesomeIcon
              icon={currentSection === "privacy-help" ? faArrowUp : faArrowDown}
              onClick={() =>
                handleSectionClick(
                  currentSection === "privacy-help" ? "" : "privacy-help"
                )
              }
            />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared photos</span>
            <FontAwesomeIcon
              icon={currentSection === "shared-photos" ? faArrowUp : faArrowDown}
              onClick={() =>
                handleSectionClick(
                  currentSection === "shared-photos" ? "" : "shared-photos"
                )
              }
            />
          </div>
          {currentSection === "shared-photos" && (
            <div className="photos">
              {isCurrentUserBlocked ? (
                <div>
                  <img
                    style={{ width: "100%", height: "100%" }}
                    src="/shared-photos-blocked.png"
                    alt=""
                  />
                </div>
              ) : (
                chatImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="photoItem"
                    onClick={() => handlePhotoClick(index)}
                  >
                    <div className="photoDetail">
                      <img src={imageUrl} alt="" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="option shared-files">
          <div className="title">
            <span>Shared Files</span>
            <FontAwesomeIcon
              icon={faArrowDown}
              onClick={() =>
                handleSectionClick(
                  currentSection === "shared-files" ? "" : "shared-files"
                )
              }
            />
          </div>
        </div>
        <div className="detail-buttons-container">
          <button
            className={`${blockButtonClass()}`}
            onClick={handleBlockUser}
            disabled={isCurrentUserBlocked}
            onMouseEnter={() => setIsBlockButtonHovered(true)}
            onMouseLeave={() => setIsBlockButtonHovered(false)}
          >
            {blockButtonText()}
          </button>
          <button className="logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} /> Logout
          </button>
        </div>
      </div>
      {galleryMode && (
        <Gallery
          setGalleryMode={setGalleryMode}
          chatImages={chatImages}
          initialGalleryImageIndex={initialGalleryImageIndex ?? 0}
        />
      )}
    </div>
  ) : (
    <div>No chat selected</div>
  );
};

export default Detail;
