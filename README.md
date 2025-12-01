# HandyMate 🛠️

**Your AI-Powered Solo Living DIY Assistant**

![HandyMate App Screenshot](screenshot.png)

> "Like having a calm, patient friend who’s really good with tools standing right behind you."

**HandyMate** is a hyper-practical AI app designed to take the anxiety out of home repairs for solo dwellers. It turns your phone into a visual coach, providing instant diagnoses, step-by-step guides, and a supportive community connection.

## ✨ Features

-   **📸 Instant Issue Scanner**: Snap a photo of a leaky tap or wobbly shelf, and Gemini 2.5 Flash analyzes the problem in seconds.
-   **📝 Visual Step-by-Step Guides**: Get clear, jargon-free instructions with AI-generated diagrams for every step.
-   **📍 Smart Tool Finder**: Locates the exact tools you need at nearby hardware stores using Google Maps grounding.
-   **🤝 Community Bench**: A "Notice Board" style social feed to ask neighbors for help or lend a hand on local projects.
-   **🍱 Gamified Progress**: Track your "fix streak" and earn badges in your virtual lunchbox to build DIY confidence.
-   **💬 Walkie-Talkie Chat**: Connect with community members via a retro-styled text interface to troubleshoot together.

## 🎨 Design Philosophy

Built with the **"Cozy Workshop Haven"** design system:
-   **Palette**: Walnut wood, Confidence Green, and Warning Amber.
-   **Metaphor**: The UI behaves like a physical workbench—tools hang on pegboards, steps are index cards, and badges clunk into a metal lunchbox.
-   **Sound & Feel**: Subtle haptics and skeuomorphic sound effects (paper rustles, metal latches) make the digital experience feel tactile and grounded.

## 🛠️ Tech Stack

-   **Frontend**: React 19, Tailwind CSS
-   **AI Intelligence**: Google Gemini API (`gemini-2.5-flash` for vision/text, `gemini-2.5-flash-image` for diagrams)
-   **Grounding**: Google Maps API (via Gemini tools)
-   **Styling**: Custom Tailwind configuration with standard CSS filters for texture effects.

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/handymate.git
    cd handymate
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Run the development server**
    ```bash
    npm start
    ```

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
