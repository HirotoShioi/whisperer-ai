# Whisperer

Whisperer is a privacy-focused, browser-based AI chat application. All message history is stored locally, ensuring that no data is sent to external servers. Utilizing pglite with pgvector, Whisperer enhances AI interactions and enables seamless conversations with PDF documents.

![demo](https://github.com/user-attachments/assets/539b4887-66a1-4952-bd1b-d35f51f8b118)

## Features

- **Privacy-First**: All data is stored locally, preserving user privacy.
- **Browser-Based**: No installation required; accessible directly from the browser.
- **Powerful RAG Capabilities**: Leverages pgvector for advanced Retrieval-Augmented Generation (RAG), combining information retrieval and AI-generated responses.
- **PDF Interaction**: Load PDFs and interact with the content through AI.
- **Modern Tech Stack**: Built with React, Tailwind CSS, shadcn, ai-sdk, Drizzle, and pglite.

## How does it work?

Whisperer utilizes the `pglite` library to store all data locally in IndexedDB. This approach ensures that no data ever leaves the user's device, maintaining privacy and security. Additionally, `pglite` supports the `pgvector` extension, allowing Whisperer to implement Retrieval-Augmented Generation (RAG) by leveraging embeddings for more accurate and context-aware AI interactions.

## Tech Stack

- **Frontend**: [react](https://react.dev/), [react-router](https://reactrouter.com/en/main)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn](https://ui.shadcn.com/)
- **Database**: [pglite](https://pglite.dev/)
- **AI Integration**: [ai-sdk](https://github.com/vercel/ai)
- **ORM**: [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/HirotoShioi/Whisperer.git
    cd Whisperer
    ```

2. Install the required packages:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open `http://localhost:3000` in your browser to use the app.

## License

This project is licensed under the [MIT License](LICENSE).

## References

- [Supabase Community - Postgres New](https://github.com/supabase-community/postgres-new/tree/main/apps/postgres-new)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs/introduction)
