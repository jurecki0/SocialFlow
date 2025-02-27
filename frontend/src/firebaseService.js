import { Client, GetPageInfoRequest, GetPageMediaRequest, GetMediaInsightsRequest, GetMediaInsightsResponse } from "instagram-graph-api";
import { auth, firestore } from "./firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

const getInstagramClient = (accessToken) => {
  return new Client({ accessToken });
};

// Store or update user profile in Firestore
async function storeUserProfile(profileData) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const userDocRef = doc(firestore, "users", user.uid);
  await setDoc(userDocRef, profileData, { merge: true });
  console.log("User profile stored:", profileData);
}

// Check if user profile exists, create one if not
async function checkAndCreateUserProfile() {
  const user = auth.currentUser;
  if (!user) {
    console.error("❌ No user logged in!");
    return;
  }

  console.log("🔹 Checking profile for:", user.uid);

  const userDocRef = doc(firestore, "users", user.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    console.log("✅ User profile already exists:", docSnap.data());
  } else {
    console.log("🟡 No profile found. Creating a new one...");
    const newUserProfile = {
      name: user.displayName || "New User",
      email: user.email || "",
      profilePic: user.photoURL || "",
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(userDocRef, newUserProfile);
      console.log("✅ New profile created for user:", user.uid);
    } catch (error) {
      console.error("❌ Error creating profile:", error);
    }
  }
}

// Fetch the user's profile from Firestore
const getUserProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userRef = doc(firestore, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }

    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const fetchInstagramAccessToken = async (code) => {
  try {
    const response = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.REACT_APP_INSTAGRAM_CLIENT_ID,
        client_secret: process.env.REACT_APP_INSTAGRAM_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: process.env.REACT_APP_INSTAGRAM_REDIRECT_URI,
        code,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      return data;
    } else {
      throw new Error("Failed to fetch access token");
    }
  } catch (error) {
    console.error("Error fetching Instagram access token:", error);
    return null;
  }
};

export const storeInstagramAccount = async (accountData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    const userRef = firebase.firestore().collection("users").doc(user.uid);
    await userRef.update({
      linkedAccounts: firebase.firestore.FieldValue.arrayUnion({
        platform: "instagram",
        username: accountData.username,
        accessToken: accountData.access_token,
      }),
    });

    console.log("Instagram account added to Firestore");
  } catch (error) {
    console.error("Error storing Instagram account:", error);
  }
};

export const fetchUserAccounts = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");
    const userRef = await firebase.firestore().collection("users").doc(user.uid).get();
    const userData = userRef.data();
    return userData?.linkedAccounts || [];
  } catch (error) {
    console.error("Error fetching linked accounts:", error);
    return [];
  }
};

export const fetchInstagramStats = async (username) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    const userRef = doc(firestore, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("User not found");

    const account = userSnap.data().linkedAccounts.find((acc) => acc.username === username);
    if (!account) throw new Error("Instagram account not linked");

    // ✅ Use `GetPageInfoRequest` to get Instagram Business Page Info
    const request = new GetPageInfoRequest(account.accessToken, account.userId);

    const response = await request.execute();

    return {
      name: response.getName(),
      followerCount: response.getFollowers(),
    };
  } catch (error) {
    console.error("❌ Error fetching Instagram insights:", error);
    return {};
  }
};

export const fetchRevenueData = async (username) => {
  // Revenue data could be fetched from another API or Firestore
  return [
    { date: "2024-02-01", revenue: 120 },
    { date: "2024-02-02", revenue: 150 },
    { date: "2024-02-03", revenue: 170 },
  ];
};
export const fetchInstagramPosts = async (username) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    const userRef = doc(firestore, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("User not found");

    const account = userSnap.data().linkedAccounts.find((acc) => acc.username === username);
    if (!account) throw new Error("Instagram account not linked");

    const { accessToken } = account;

    // Fetch posts from Instagram API
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${account.userId}/media?fields=id,caption,media_url,thumbnail_url,timestamp&access_token=${accessToken}`
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.data; // Returns an array of posts
  } catch (error) {
    console.error("❌ Error fetching Instagram posts:", error);
    return [];
  }
};

export const fetchPostPerformance = async (postId, accessToken) => {
  try {
    // 🔹 Initialize the API request
    const request = new GetMediaInsightsRequest(accessToken, postId, [
      "engagement",
      "likes",
      "comments",
    ]);

    // 🔹 Execute API request
    const response = await request.execute();

    // 🔹 Extract insights from response
    const insights = response.getMetrics();
    return {
      engagement: insights.engagement || 0,
      likes: insights.likes || 0,
      comments: insights.comments || 0,
    };
  } catch (error) {
    console.error("❌ Error fetching post performance:", error);
    return { engagement: 0, likes: 0, comments: 0 };
  }
};

const storeUserLinkedAccount = async (accountData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(firestore, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update existing user data
      await updateDoc(userRef, {
        linkedAccounts: arrayUnion(accountData),
      });
    } else {
      // Create a new user document with the linked account
      await setDoc(userRef, {
        name: user.displayName || "Unknown",
        email: user.email || "No Email",
        profilePic: user.photoURL || "",
        linkedAccounts: [accountData], // Store as an array
      });
    }

    console.log("Account linked successfully!");
  } catch (error) {
    console.error("Error storing linked account:", error);
  }
};

export { storeUserProfile, getUserProfile, checkAndCreateUserProfile, storeUserLinkedAccount };
