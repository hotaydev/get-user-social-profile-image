// Import necessary modules and types from express, body-parser, and node:crypto.
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import crypto from 'node:crypto';

const app = express(); // Create an instance of an Express application

// Disable the 'X-Powered-By' header to make the app more secure by hiding information about the tech stack
app.disable('x-powered-by');

// Use body-parser middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Array of supported account types for fetching profile images
const accountTypes = ['mastodon', 'gravatar', 'github'];

/**
 * POST endpoint to retrieve a profile image based on account type and identifier.
 * This endpoint expects `account_type` and `identifier` in the request body.
 */
app.post('/get-image', async (req: Request, res: Response): Promise<any> => {
  const { account_type, identifier } = req.body; // Destructure account_type and identifier from the request body

  // Validate that both account_type and identifier are present in the request
  if (!account_type || !identifier) {
    return res.status(400).json({ success: false, message: 'Missing account_type or identifier' });
  }

  // Validate that the provided account_type is supported
  if (!accountTypes.includes(account_type)) {
    return res.status(400).json({ success: false, message: 'Invalid account_type' });
  }

  let photo = null; // Variable to hold the fetched profile image URL

  // Switch-case to handle the different account types and fetch the appropriate image
  switch (account_type) {
    case 'github':
      photo = await getGitHubProfileImage(identifier); // Fetch GitHub profile image
      break;
    case 'gravatar':
      photo = getGravatarImage(identifier); // Fetch Gravatar profile image (synchronous)
      break;
    case 'mastodon':
      photo = await getMastodonProfileImage(identifier); // Fetch Mastodon profile image
      break;
  }

  // If no photo was retrieved, return an error response
  if (!photo) {
    return res.status(400).json({ success: false, message: 'Could not fetch the profile image' });
  }

  // Return the retrieved image URL in the success response
  return res.status(200).json({
    success: true,
    photo: photo,
  });
});

/**
 * Fetches the GitHub profile image for a given username.
 * @param username - GitHub username
 * @returns A Promise that resolves to the GitHub avatar URL, or null if not found.
 */
const getGitHubProfileImage = async (username: string): Promise<string | null> => {
  try {
    // Fetch user data from GitHub's public API
    return await fetch(`https://api.github.com/users/${username}`)
      .then((res) => res.json()) // Parse the JSON response
      .then((data) => {
        if (data.avatar_url) return data.avatar_url; // Return avatar URL if available
        return null; // Return null if no avatar URL found
      });
  } catch (error) {
    console.error('Error fetching GitHub profile:', error); // Log any errors during the request
    return null; // Return null if an error occurs
  }
};

/**
 * Fetches the Mastodon profile image for a given username.
 * @param username - Mastodon username (acct)
 * @returns A Promise that resolves to the Mastodon avatar URL, or null if not found.
 */
const getMastodonProfileImage = async (username: string): Promise<string | null> => {
  try {
    // Fetch user data from Mastodon's public API (assuming mastodon.social instance)
    return await fetch(`https://mastodon.social/api/v1/accounts/lookup?acct=${username}`)
      .then((res) => res.json()) // Parse the JSON response
      .then((data) => {
        if (data.avatar) return data.avatar; // Return avatar URL if available
        return null; // Return null if no avatar found
      });
  } catch (error) {
    console.error('Error fetching Mastodon profile:', error); // Log any errors during the request
    return null; // Return null if an error occurs
  }
};

/**
 * Generates the Gravatar image URL for a given email address.
 * @param email - User's email address
 * @returns The Gravatar image URL.
 */
const getGravatarImage = (email: string): string => {
  const normalizedEmail = email.trim().toLowerCase(); // Normalize email by trimming whitespace and converting to lowercase
  const hash = crypto.createHash('sha256').update(normalizedEmail).digest('hex'); // Generate SHA-256 hash of the email
  return `https://gravatar.com/avatar/${hash}?s=400`; // Return the Gravatar image URL
};

// Define the port from the environment variables or use the default port (3000)
const port = process.env.PORT || 3000;

// Start the Express server and log a message when it is running
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});