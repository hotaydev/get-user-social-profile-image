# Social Profile Avatar API

A small Node.js Express API that retrieves user profile avatar pictures from various social accounts.

## Supported Accounts
- Mastodon
- GitHub
- Gravatar

## API Endpoint

### Request
Send a POST request to `/get-image` with the following JSON body:

```json
{
  "account_type": "github",
  "identifier": "profile_id"
}
```

### Response
The API responds with a JSON object:

```json
{
  "success": true,
  "photo": "profile_picture_url"
}
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hotaydev/get-user-social-profile-image.git
   ```

2. Navigate to the project directory:
   ```bash
   cd get-user-social-profile-image
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Start the server:
   ```bash
   pnpm dev
   ```

## License

This project is licensed under the [MIT License](./LICENSE).
