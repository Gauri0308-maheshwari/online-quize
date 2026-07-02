# ⚡ QuizPulse - Mern-Stack Online Quiz Application with Gemini AI

QuizPulse is a premium, modern, and fully responsive testing platform built on the MERN stack. Designed with a sleek visual aesthetic (including glassmorphism and light/dark theme modes), it supports secure JWT authentication, interactive student quiz interfaces, and a robust admin panel featuring an automated AI Question Generator powered by the Google Gemini API.

## ✨ Core Features

* 🔐 **Authentication & RBAC**: Role-based access control separating Student dashboards from Admin management routes. Supports password recovery and profile picture uploads.
* 🤖 **AI Question Generator (Gemini)**: Admins can automatically construct MCQs and multi-correct questions by prompting Gemini with a quiz title, difficulty, and custom topic guidelines.
* ⏱️ **Interactive Timed Attempts**: Client-side auto-saving (localStorage backed), interactive question navigator dashboard, and warning animations under 1 minute.
* 📊 **Analytics Dashboards**: Rich charts (Area & Bar graphs via Recharts) displaying student scores, category strengths, attempt frequencies, and platform metrics.
* 🎓 **PDF Certificate Generator**: Instant, client-side download of landscape accomplishment certificates using `jsPDF` upon passing a quiz.
* 🎨 **Premium Aesthetics**: Dark/Light mode theme toggle, glassmorphic cards, responsive Tailwind layouts, and micro-interactions.
