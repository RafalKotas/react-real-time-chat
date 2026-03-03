# CustomEmojiPicker 

## Props:

```
interface CustomEmojiPickerProps {
    onEmojiClick: (emoji: string | undefined) => void;
}
```
`Chat.tsx` call:
```
const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
};

(...)

{
    showEmojiPicker && (
                    <CustomEmojiPicker onEmojiClick={(emoji) => handleEmojiClick(emoji as string)} />
    )
}
```

Result: Appends emoji icon to the end of chat message to send.

## useState variables:
- `const [activeCategory, setActiveCategory] = useState<string>("smiles");`

`activeCategory` - used to get all data (activeCategoryData) of category entry from `categories` (`emoji-icons.ts`):

```
const activeCategoryData = categories.find(cat => cat.id === activeCategory) || categories[0];
```

Default `activeCategoryData` is `categories[0]` ("smiles")

## Rendering:

### Active button className: 

```
<button
    key={category.id}
    className={`emoji-tab ${activeCategory === category.id ? 'active' : ''}`}
    onClick={() => setActiveCategory(category.id)}
    type="button"
    title={category.name}
>
    {toEmojiItem(emojis[0])?.icon}
</button>
```

Active button have class with following styles (`CustomEmojiPicker.css`):
```
.emoji-button:active {
    background-color: #e0e0e0;
    transform: scale(0.95);
}
```

### Rendering emoji item:

```
{toEmojiItem(emojis[0])?.icon}
```

Function content:
```
export function toEmojiItem(e: EmojiItem | string | undefined): EmojiItem | undefined {
    
    if (e == null) return undefined;
    
    if (typeof e === "string") return e === "" ? undefined : { icon: e, name: "Emoji" };
    
    return e.icon === "" ? undefined : e;
}
```

### Active category emojis

```
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
```

1. Render every emoji-group in another div
2. Add group label for every emoji group (f.e. for "smiles" - "Face-smilling", "Face-affection", "Face-tongue", (...))
3. Filter and remove null / undefined emojis from `group.emojis`
4. Render `item.icon` button inside `Tooltip` within div with `emoji-grid` className (grid of emoji width 7).

