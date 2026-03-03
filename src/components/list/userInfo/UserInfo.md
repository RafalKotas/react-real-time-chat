# UserInfo

## About

Component for display basic data for logged user including:
- avatar
- username

and icons:
- faEllipsis (…)
- faVideo (🎥)
- faEdit (✎)

## Zustand Store variables:

```
const {user: currentUser} = useUserStore();
```

`currentUser` - user that is the logged through firebase auth

## Component's code
```html
<div className='userInfo'>
    <div className="user">
        <img src={currentUser?.avatar || "./user.png"} alt="" />
        <h2>{currentUser?.username}</h2>
    </div>
    <div className="icons">
        <FontAwesomeIcon icon={faEllipsis} />
        <FontAwesomeIcon icon={faVideo} />
        <FontAwesomeIcon icon={faEdit} />
    </div>
</div>
```