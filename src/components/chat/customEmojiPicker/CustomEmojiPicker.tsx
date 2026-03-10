import "./CustomEmojiPicker.css"
import { memo, useState } from "react"
import { categories, getCategoryEmojis, toEmojiItem } from "./emoji-icons"
import Tooltip from "./Tooltip"

interface CustomEmojiPickerProps {
    onEmojiClick: (emoji: string | undefined) => void;
}

const CustomEmojiPicker = memo(function CustomEmojiPicker({ onEmojiClick }: CustomEmojiPickerProps) {
    const [activeCategory, setActiveCategory] = useState<string>("smiles");

    const activeCategoryData = categories.find(cat => cat.id === activeCategory) || categories[0];

    return (
        <div className="custom-emoji-picker">
            <div className="emoji-tabs">
                {categories.map((category) => {
                    const emojis = getCategoryEmojis(category);
                    return (
                        <button
                            key={category.id}
                            className={`emoji-tab ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category.id)}
                            type="button"
                            title={category.name}
                        >
                            {toEmojiItem(emojis[0])?.icon}
                        </button>
                    );
                })}
            </div>
            <div className="emoji-content">
                <div className="emoji-category-title">{activeCategoryData.name}</div>
                {activeCategoryData.groups.map((group) => (
                    <div key={group.id} className="emoji-group">
                        <div className="emoji-group-header">{group.label}</div>
                        <div className="emoji-grid">
                            {group.emojis
                                .map(toEmojiItem)
                                .filter((item): item is NonNullable<ReturnType<typeof toEmojiItem>> => item != null)
                                .map((item, index) => (
                                    <Tooltip key={`${group.id}-${index}`} label={item.name}>
                                        <button
                                            className="emoji-button"
                                            onClick={() => onEmojiClick(item.icon)}
                                            type="button"
                                        >
                                            {item.icon}
                                        </button>
                                    </Tooltip>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default CustomEmojiPicker;

