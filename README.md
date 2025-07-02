# TKS Prepify

Welcome to the **TKS Prepify** repository! This project is a comprehensive **Exam Preparation Platform** built by TheKhanSoft to empower individuals preparing for various exams with robust, AI-enhanced features.

---

## 📋 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Testing](#testing)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Security Vulnerabilities](#security-vulnerabilities)
- [License](#license)
- [Contact](#contact)

---

## 📝 Introduction

**TKS Prepify** is a comprehensive web application meticulously designed to serve as a robust platform for individuals preparing for various exams. The application provides a powerful set of tools for both administrators and exam takers to streamline question management, exam creation, AI-powered feedback, and performance analysis—all with a modern, responsive interface.

---

## ✨ Features

- **User Authentication:** Secure signup and login for users and administrators using Firebase Authentication.
- **Admin Dashboard:**
  - Manage exam categories, papers, questions, and user accounts.
  - Create, edit, copy, and delete exam papers and questions.
- **User Experience:**
  - Browse categories and select papers easily.
  - Take exams with an interactive, timed interface.
  - Get detailed results analysis, including score breakdown and performance insights.
- **AI Integration:**
  - Description generation for categories/papers.
  - SEO optimization for content.
  - Personalized feedback on exam performance.
  - AI-based study resource recommendations.
- **Responsive Design:** Mobile-friendly UI with modern component library (Shadcn UI).
- **Comprehensive Reporting:** View score breakdowns and analytics.

---

## 🛠️ Technologies Used

- **Framework:** Next.js
- **Frontend:** Next.js, React, TypeScript
- **Backend:** Firebase (Authentication, Firestore)
- **UI Components:** Shadcn UI
- **AI/ML:** Genkit
- **Styling:** Tailwind CSS

---

## ⚙️ Installation

Follow these steps to set up the project locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/TheKhanSoft/tks-prepify.git
   ```
2. Navigate to the project directory:
   ```bash
   cd tks-prepify
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up your environment variables by copying `.env.example` to `.env` and updating as needed.
5. Configure Firebase credentials and Genkit settings as required.

---

## 🚀 Usage

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Access the application in your browser at `http://localhost:3000`.
3. Log in or sign up as a user or administrator to explore features.

---

## 🛠️ Configuration

- All configuration files are found in the root or `src` directory (e.g., `src/lib/firebase.ts`, `src/ai/genkit.ts`).
- Edit `.env` to set up API keys, Firebase credentials, and other environment variables as needed.

---

## 🧪 Testing

- Currently, manual testing is recommended. Automated tests may be added in future releases.
- To contribute tests, create files in a `__tests__` or `tests` directory using your preferred testing framework.

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. Fork this repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push to your branch.
4. Submit a pull request with a detailed description of the changes.

---

## 📜 Code of Conduct

Please review and abide by our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming community for all.

---

## 🔒 Security Vulnerabilities

If you discover a security vulnerability, please report it by emailing [TheKhanSoft](mailto:thekhansoft@gmail.com). We will address all security issues promptly.

---

## 📄 License

This software is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.

[![CC BY-NC 4.0][cc-by-nc-shield]][cc-by-nc]

[cc-by-nc]: https://creativecommons.org/licenses/by-nc/4.0/
[cc-by-nc-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg

See the [LICENSE](LICENSE.md) file for more detail.

---

## 📞 Contact

For any questions or inquiries, feel free to reach out:

- GitHub: [TheKhanSoft](https://github.com/TheKhanSoft)
- Email: [thekhansoft (at) gmail dot com](mailto:thekhansoft@gmail.com)

---

Thank you for contributing to and supporting **TKS Prepify**!