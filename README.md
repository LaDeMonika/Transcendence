*This project has been created as part
of the 42 curriculum by [**Monika Simic** - PO & Full-stack](https://profile.intra.42.fr/users/msimic), [**Moritz Karl Resch** - SM & Backend](https://profile.intra.42.fr/users/mresch), [**Oksana Hnatiuk** - Frontend](https://profile.intra.42.fr/users/ohnatiuk), [**Christoph Thaler** - Backend](https://profile.intra.42.fr/users/cthaler) and [**Hüsrev Akbas** - Database](https://profile.intra.42.fr/users/huakbas).*
# Transcendence

## Description
A real-time multiplayer trivia platform where players pick categories and battle through quick rounds. We are building a web-first experience for 3+ players. A points-based award system, live leaderboards, achievements, and an analytics dashboard will keep competition lively and help us tune questions and balance over time.

### Key Features
- **Real-Time Multiplayer:** Engage in trivia battles with 3 or more players simultaneously.
- **Gamified Points System:** Earn points as rewards for winning and participating in trivia rounds.
- **Live Leaderboards:** Real-time updates to see where you stand.
- **Analytics Dashboard:** Insights to tune questions and maintain game balance.

## Instructions
- **Prerequisites**: Docker, Docker Compose, Make, OpenSSL.
- **Configuration**: Copy `.env.example` to `.env` and configure the database credentials (`DB_USER`, `DB_PASSWORD`, `DB_DATABASE`).
- **Execution**: 
  1. Run `make` to automatically generate SSL certificates, build the Docker images, and start the containers.
  2. Access the application at `https://localhost:8443` or `http://localhost:8080`.
  3. To stop the application, run `make down`. To completely remove volumes and clean up, run `make clean`.

## Resources
- [Vue.js 3 Documentation](https://vuejs.org/guide/introduction.html)
- [AdonisJS 6 Documentation](https://docs.adonisjs.com/guides/preface/introduction)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- *AI Usage:* ChatGPT was used for generating ideas, debugging, and learning new technologies. GitHub Copilot was used for code completion and suggestions.

## Team Information
| Role | Team member(s) | Responsibilities |
| --- | --- | --- |
| Product Owner | [Monika Simic (msimic)](https://profile.intra.42.fr/users/msimic) | Owns product vision and backlog, sets priorities, accepts/rejects delivered features, aligns stakeholders. |
| Scrum Master | [Moritz Karl Resch (mresch)](https://profile.intra.42.fr/users/mresch) | Facilitates ceremonies, removes blockers, tracks delivery flow, keeps team aligned with process. |
| Architect | All team members | Defines architecture and tech stack choices, guards quality standards, reviews critical designs/PRs. |
| DEV (frontend) | [Oksana Hnatiuk (ohnatiuk)](https://profile.intra.42.fr/users/ohnatiuk), [Monika Simic (msimic)](https://profile.intra.42.fr/users/msimic) | Builds UI/UX flows, real-time interactions, and styling; maintains client-side quality and tests. |
| DEV (backend) | [Moritz Karl Resch (mresch)](https://profile.intra.42.fr/users/mresch), [Christoph Thaler (cthaler)](https://profile.intra.42.fr/users/cthaler), [Hüsrev Akbas (huakbas)](https://profile.intra.42.fr/users/huakbas) | Designs and builds services/APIs, real-time game logic, auth, and infrastructure reliability. |
| DEV (database) | [Hüsrev Akbas (huakbas)](https://profile.intra.42.fr/users/huakbas), [Christoph Thaler (cthaler)](https://profile.intra.42.fr/users/cthaler) | Owns schema/design, query performance, migrations, and data integrity/analytics pipelines. |

## Project Management
- **Task Distribution & Meetings**: Regular stand-ups and sprint planning led by the Scrum Master. Features were broken down into stories and assigned to developers.
- **Tools**: GitHub Issues/Projects for tracking progress and managing the backlog.
- **Communication Channels**: Discord for daily communication and real-time collaboration.

## Technical Stack
| Category | Technology | Description/Notes | Reference |
| --- | --- | --- | --- |
| **Frontend** | Vue.js 3 | Reactive and component-based frontend framework. | [Vue.js Docs](https://vuejs.org/guide/introduction.html) |
| **Frontend** | Bootstrap 5 & Vite | UI framework and fast build tool. | [Bootstrap Docs](https://getbootstrap.com/docs/5.3/) |
| **Backend** | AdonisJS 6 | Robust MVC Node.js framework. | [AdonisJS Docs](https://docs.adonisjs.com/) |
| **Database** | PostgreSQL | Reliable relational database system. | [PostgreSQL Docs](https://www.postgresql.org/docs/) |
| **ORM** | Lucid ORM | AdonisJS integrated Active Record ORM. | [Lucid ORM Docs](https://docs.adonisjs.com/) |
| **WebSockets** | adonisjs-websocket | Real-time communication for chat and game sync. | |

**Justification for Major Technical Choices:**
- **Vue.js & AdonisJS**: Chosen for a clean separation of concerns. Vue provides a highly interactive user experience, while AdonisJS offers a structured, opinionated backend with built-in security and ORM.
- **PostgreSQL**: Selected for its robustness, ACID compliance, and excellent support for relational data (crucial for users, friends, chat, and game sessions).

## Database Schema
The database is relational and structured as follows:
- **Users Table**: Stores `id`, `email`, `userName`, `password`, and `avatarUrl`.
  - **Friends (Pivot Table)**: Many-to-Many relationship between Users tracking friend `status`.
- **Chat System**:
  - **Conversations**: Stores chat sessions.
  - **ConversationParticipants**: Links `Users` to `Conversations`.
  - **Messages**: Links `content` to `Conversations` and `Users` (sender).
- **Trivia System**:
  - **Quizzes**: Stores `title` and metadata.
  - **Questions**: Has a Many-to-One relationship with `Quizzes`.
  - **Quiz Sessions**: Tracks live games (`state`, `current_question_id`, timings like `question_started_at`).
  - **Quiz Players & Spectators**: Links `Users` to active `Quiz Sessions`.

## Features List
- **User Authentication & Profiles**: Secure login/registration using session tokens (`DbAccessTokensProvider`), user profile management, and avatar uploads. *(Moritz)*
- **Friends System**: Send, accept, and manage friend requests. *(Moritz, Husrev)*
- **Real-Time Chat**: Live messaging system utilizing WebSockets, supporting multiple conversations. *(Moritz, Monika, Oksana)*
- **Multiplayer Trivia Game**: Real-time trivia battles with state synchronization, precise timing (`question_started_at`, `reveal_ends_at`), and spectator mode. *(Moritz, Husrev, Monika, Oksana)*
- **Data Import/Export**: Functionality to manage trivia data using `csv-parse`. *(Moritz)*

## Modules

| Module | Description | Implementation Details & Justification | Points | Contributors |
| --- | --- | --- | --- | --- |
| **Full-Stack Framework** (Major) | Use a framework for frontend and backend. | Vue handles the SPA experience via Vite; AdonisJS serves REST endpoints. | 2 | Monika, Oksana, Moritz, Husrev |
| **WebSocket Integration** (Major) | Implement real-time features using WebSockets. | Built with `adonisjs-websocket` for live chat and game state syncing. | 2 | Moritz, Oksana |
| **User Interaction System** (Major) | Basic chat, profile, and friends system. | Implemented via `Conversations`/`Messages` tables and a `friends` pivot table. | 2 | Moritz, Monika, Oksana |
| **Public API** (Major) | Secured API with rate limiting and 5+ endpoints. | RESTful AdonisJS controllers secured by middleware and API tokens. | 2 | Moritz |
| **ORM-Based Data Access** (Minor) | Use an ORM for the database. | Lucid ORM is used exclusively for all database interactions. | 1 | Husrev, Moritz |
| **User Management & Auth** (Major) | Update profile, avatar, friends, online status. | Built on AdonisJS Auth (`DbAccessTokensProvider`) with Vue profile views. | 2 | Moritz, Monika, Oksana |
| **Game Statistics & History** (Minor) | Track stats, match history, achievements, leaderboard. | Stats tracked in DB and served via API to Vue leaderboard components. | 1 | Moritz, Husrev, Monika |
| **Web-Based Game** (Major) | Real-time multiplayer game with clear rules. | Trivia game engine running on AdonisJS, with Vue frontend interfaces. | 2 | Moritz, Husrev, Monika, Oksana |
| **Remote Players** (Major) | Two players on separate computers in real-time. | Controlled via `QuizSession` model with strict timestamps and WebSocket broadcasts. | 2 | Moritz, Husrev, Monika, Oksana |
| **Spectator Mode** (Minor) | Allow users to watch ongoing games. | Real-time WebSocket broadcasts sent to connected `QuizSpectator`s. | 1 | Moritz, Monika, Oksana |
| **Data Import/Export** (Minor) | Data export and import functionality. | Handled via backend utilities leveraging `csv-parse`. | 1 | Moritz |
| **Additional Browsers** (Minor) | Compatibility with Firefox, Safari, Edge. | Responsive and cross-browser tested UI via Bootstrap and Vue. | 1 | Monika, Oksana |
| **Activity Analytics Dashboard** (Minor) | User activity analytics and insights. | Aggregated data queries served to frontend dashboard components. | 1 | Moritz, Monika |
| **Gamification System** (Minor) | Rewards, achievements, XP/level system. | Persistent rewards tracked in DB, visual feedback implemented in Vue. | 1 | Moritz, Monika, Oksana |
| **Total** | | | **21** | |

## Individual Contributions
- **Monika Simic (PO & Full-stack)**: 
    * Focused entirely on the frontend using Vue.js. 
    * Organized and managed project issues on GitHub.
- **Oksana Hnatiuk (Frontend)**: 
    * Focused on the frontend and connecting the UI with the backend API.
    * Fixed various Docker-related bugs and deployment issues.
- **Hüsrev Akbas (Database)**: 
    * Focused heavily on the database architecture, schema design, and backend integration.
- **Christoph Thaler (Backend)**: 
    * Mostly focused on Docker, containerization, and ensuring the environment runs smoothly.
- **Moritz Karl Resch (SM & Backend)**: 
    * Developed most of the backend API infrastructure.
    * Implemented the import/export features and real-time WebSockets logic.