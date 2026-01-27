# Twitter Unfollow Helper

[简体中文](./README_CN.md) | English

A powerful JavaScript browser extension (Tampermonkey/Console) to help Twitter (X) users quickly identify and filter users who **don't follow you back**.

## 🌟 Key Features

- **Automatic Detection**: Real-time monitoring of the "Follows you" label on Twitter's following list.
- **Visual Filtering**:
  - **Non-Followers**: Highlighted with a red background and border for instant recognition.
  - **Mutual Followers**: Faded out by default to focus on targets.
- **Physical "Clean" Mode**: Toggle a specialized mode to completely remove mutual followers **from the view**, leaving a continuous list of non-followers.
- **Smart Adaptive Scrolling**: Automatically scrolls through large following lists.
- **Interactive Control Panel**: Floating UI in the top-right corner with Start, Pause/Resume, and "Clean List" controls.
- **Persistence**: Uses CSS injection and attribute tracking to survive Twitter's dynamic DOM recycling (React).
- **Multi-language Support**: Detects follow status in English, Simplified Chinese, and Traditional Chinese.
- **Safety**: Purely a visual aid. No automated API calls or "Mass Unfollow" actions that could trigger account bans.

## 🚀 Installation

### Option 1: Install as Userscript (Recommended)
1. Install a Userscript manager like [Tampermonkey](https://www.tampermonkey.net/).
2. [Click here to install from Greasy Fork](https://greasyfork.org/scripts/YOUR_SCRIPT_ID) *(Currently publishing...)*.

### Option 2: Browser Console
1. Copy the code from `twitter_unfollow_helper.js`.
2. Go to your Twitter Following page: `https://twitter.com/[username]/following`.
3. Press `F12` and paste the code into the **Console** tab, then hit `Enter`.

## 🛠 How to Use

1. Navigate to your **Following** page on Twitter/X.
2. Look for the control panel in the top-right corner.
3. Click **Start/Resume** to begin auto-scrolling and marking.
4. Click **Clean List** once you want to hide all mutual followers and focus only on the red-marked accounts.
5. If you decide to unfollow someone, you can click **Pause**, unfollow manually, and click **Resume**.

## ⚠️ Disclaimer

This script is for educational purposes and personal use only. Please comply with Twitter's (X) Terms of Service. While this script does not perform automated unfollowing actions, performing manual mass-unfollowing in a very short period might still be flagged by Twitter's safety systems. Use responsibly.