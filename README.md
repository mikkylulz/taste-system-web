# Taste System Web App 🧠🚀

A premium web application to evaluate product ideas through a personalized AI personality filter. Built with Next.js 14 and Gemini API.

## Features
- **Streaming Evaluation**: Real-time progress updates as gates run.
- **Claude.ai Inspired UI**: Clean, minimal, and focused design.
- **History Tracking**: LocalStorage-based history sidebar.
- **Markdown Export**: Download your evaluation reports.

## Setup & Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```

3. **Run Design System**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

This app is optimized for Vercel:

1. **Push to GitHub**:
   Initialize a repo and push your code.

2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click "Add New" -> "Project".
   - Select your GitHub repo.

3. **Configure Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or `taste-system-web`)
   - **Environment Variables**: Add `GEMINI_API_KEY`.

4. **Deploy**:
   Click "Deploy". Your app will be live in seconds.

## Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI**: [Google Gemini Pro](https://aistudio.google.com/)
