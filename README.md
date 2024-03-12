
# Youtube Backend

- Developed through MERN Technology
- Used Aggregation Pipelines 
- Used Cloudinary for Storage


## Deployment

to clone this project

```bash
  git clone https://github.com/ManasHalari/Youtube-Backend.git
```

first install all dependencies

```bash
  npm i
```

To deploy this project run

```bash
  npm run dev
```


## 🔗 Links
- [Model_Link]( https://app.eraser.io/workspace/a8fwbknXiL4qb9jpHIow)



## API Reference

### Healthcheck


#### for Server Healthcheck

```http
  GET /api/v1/healthcheck
```

### User

#### Register

```http
  POST /api/v1/users/register
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `username`      | `string` | **Required**. username of user to register |
| `fullname`      | `string` | **Required**. fullname of user to register |
| `email`      | `string` | **Required**. email of user to register |
| `password`      | `string` | **Required**. password of user to register |
| `avatar`      | `Image` | **Required**. avatar of user to register |
| `coverImage`      | `Image` | **Optional**. coverImage of user to register |

#### Login

```http
  POST /api/v1/users/login
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `username`      | `string` | **Required**. username of user to register |
| `email`      | `string` | **Required**. email of user to register |
| `password`      | `string` | **Required**. password of user to register |

#### Logout

```http
  POST /api/v1/users/logout
```

#### Refresh Access Token

```http
  POST /api/v1/users/refresh-token
```

#### Change Current Password

```http
  POST /api/v1/users/changepassword
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `old_password`      | `string` | **Required**. old_password of user to register |
| `new_password`      | `string` | **Required**. new_password of user to register |

#### Get User

```http
  POST /api/v1/users/
```

#### Update Account Details

```http
  PATCH /api/v1/users/updatedetails
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `username`      | `string` | **Required**. username of user to register |
| `email`      | `string` | **Required**. email of user to register |

#### Update Account Avatar

```http
  PATCH /api/v1/users/updatedavatar
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `avatar`      | `Image` | **Required**. avatar of user to register |

#### Update Account CoverImage

```http
  PATCH /api/v1/users/updatedcoverimage
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `coverImage`      | `Image` | **Required**. coverImage of user to register |

#### Get User Channel Profile

```http
  POST /api/v1/users/getuserchannelprofile/:username
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `username`      | `string` | **Required**. username of user to register |

#### Get Watch History

```http
  GET /api/v1/users/history
```

### Video

#### Publish Video

```http
  POST /api/v1/videos
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoFile`      | `Video` | **Required**. videoFile of video to register |
| `thumbnail`      | `Image` | **Required**. thumbnail of video to register |
| `title`      | `string` | **Required**.title of video to register |
| `description`      | `string` | **Required**. description of video to register |

#### Get Videos

```http
  GET /api/v1/videos
```

#### Get Video by id

```http
  GET /api/v1/videos/:videoId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoId`      | `string` | **Required**. videoId of video to register |

#### Update Video Text Part

```http
  PATCH /api/v1/videos/:videoId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoId`      | `string` | **Required**. videoId of video to change video text part |
| `title`      | `string` | **Required**.title of video to change video text part |
| `description`      | `string` | **Required**. description of video to change video text part |

#### Update Video Files Part

```http
  POST /api/v1/videos/:videoId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoId`      | `string` | **Required**. videoId of video to change video text part |
| `videoFile`      | `Video` | **Required**. videoFile of video to register |
| `thumbnail`      | `Image` | **Required**. thumbnail of video to register |

#### Delete Video

```http
  DELETE /api/v1/videos/:videoId
```
#### Toggle Publish Status

```http
  POST /api/v1/toggle/publish/:videoId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoId`      | `string` | **Required**. videoId of video to change video text part |

### Like

#### Toggle Video Like

```http
  POST /api/v1/likes/:VideoId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoId`      | `string` | **Required**. videoId of video to toggle like |

#### Toggle Comment Like

```http
  POST /api/v1/likes/:commentId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `commentId`      | `string` | **Required**. commentId of comment to toggle like |

#### Toggle Video Like

```http
  POST /api/v1/likes/:tweetId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `tweetId`      | `string` | **Required**. tweetId of tweet to toggle like |

#### Get Liked Videos

```http
  GET /api/v1/likes
```

### Comment

#### Add Comment

```http
  POST /api/v1/comments/:videoId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoId`      | `string` | **Required**. videoId of video to add comment |
| `comment`      | `string` | **Required**. comment of video to add comment |

#### Get Comment

```http
  GET /api/v1/comments/:videoId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoId`      | `string` | **Required**. videoId of video to add comment |

#### Update Comment

```http
  PATCH /api/v1/comments/c/:commentId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `commentId`      | `string` | **Required**. commentId of video to update comment |
| `new_comment`      | `string` | **Required**. comment of video to update comment |

#### Delete Comment

```http
  DELETE /api/v1/comments/c/:commentId
```

### Tweet

#### Create Tweet

```http
  POST /api/v1/comments
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `tweet`      | `string` | **Required**. tweet it is like a community post |

#### Get Tweets

```http
  GET /api/v1/comments/user/:userId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `userId`      | `string` | **Required**. userId of user to get tweets|

#### Update Tweet

```http
  POST /api/v1/comments/:tweetId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `tweetId`      | `string` | **Required**. tweetId of tweet to update tweet|
| `new_tweet`      | `string` | **Required**. new_tweet it is like a community post |

#### Delete Tweet

```http
  DELETE /api/v1/comments/:tweetId
```

### Playlist

#### Add Video To Playlist

```http
  PATCH /api/v1/playlists/add/:videoId/:playlistId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoId`      | `string` | **Required**. videoId of video to create playlist|
| `playlistId`      | `string` | **Required**. playlistId of  playlist |

#### Delete Video To Playlist

```http
  PATCH /api/v1/playlists/remove/:videoId/:playlistId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoId`      | `string` | **Required**. videoId of video to Delete playlist|
| `playlistId`      | `string` | **Required**. playlistId of  playlist |

#### Update Playlist

```http
  PATCH /api/v1/playlists/:playlistId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `playlistId`      | `string` | **Required**. playlistId of  playlist to update playlist|
| `name`      | `string` | **Required**.name of playlist to update playlist |
| `description`      | `string` | **Required**. description of playlist to update playlist |

#### Delete Playlist

```http
  DELETE /api/v1/playlists/:playlistId
```

#### Get Playlist

```http
  GET /api/v1/playlists/:playlistId
```

#### Get Playlist Of User

```http
  GET /api/v1/playlists/user/:userId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `userId`      | `string` | **Required**. userId of user to get playlist|

### Subscription

#### Toggle Subscription

```http
  POST /api/v1/subscriptions/c/:channelId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `channelId`      | `string` | **Required**. channelId of user to toggle subscription|

#### Get User Channel Subscribers

```http
  GET /api/v1/subscriptions/c/:channelId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `channelId`      | `string` | **Required**. channelId of user to get subscribers|

#### Toggle Subscription

```http
  GET /api/v1/subscriptions/u/:subscriberId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `subscriberId`      | `string` | **Required**. subscriberId of user to get those channel who have user subscribed|

### Dashboard

#### Get Channel Stats

```http
  GET /api/v1/dashboard/stats
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `channelId`      | `string` | **Required**. channelId of user to get stats of channel|

#### Get Channel Videos

```http
  GET /api/v1/dashboard/videos
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `channelId`      | `string` | **Required**. channelId of user to get those videos which are published by channel|

















