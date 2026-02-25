*This project has been created as part
of the 42 curriculum by [**Monika Simic** - PO & Full-stack](https://profile.intra.42.fr/users/msimic), [**Moritz Karl Resch** - SM & Backend](https://profile.intra.42.fr/users/mresch), [**Oksana Hnatiuk** - Frontend](https://profile.intra.42.fr/users/ohnatiuk), [**Christoph Thaler** - Backend](https://profile.intra.42.fr/users/cthaler) and [**Hüsrev Akbas** - Database](https://profile.intra.42.fr/users/huakbas).*
# Transcendence

### Description
A real-time multiplayer trivia platform where players pick categories, battle through quick rounds, and advance across tournaments. We are building a web-first experience for 3+ players with matchmaking, gamified rewards, and progression. Live leaderboards, achievements, and an analytics dashboard will keep competition lively and help us tune questions and balance over time.

### Instructions
tbd

### Resources
tbd

## Team Information
| Role | Team member(s) | Responsibilities |
| --- | --- | --- |
| Product Owner | [Monika Simic (msimic)](https://profile.intra.42.fr/users/msimic) | Owns product vision and backlog, sets priorities, accepts/rejects delivered features, aligns stakeholders. |
| Scrum Master | [Moritz Karl Resch (mreschc)](https://profile.intra.42.fr/users/mresch) | Facilitates ceremonies, removes blockers, tracks delivery flow, keeps team aligned with process. |
| Architect | All team members | Defines architecture and tech stack choices, guards quality standards, reviews critical designs/PRs. |
| DEV (full-stack) | [Monika Simic (msimic)](https://profile.intra.42.fr/users/msimic) | Delivers end-to-end features across frontend/backend, stitches APIs and UI, ensures integration quality. |
| DEV (frontend) | [Oksana Hnatiuk (ohnatiuk)](https://profile.intra.42.fr/users/ohnatiuk), [Monika Simic (msimic)](https://profile.intra.42.fr/users/msimic) | Builds UI/UX flows, real-time interactions, and styling; maintains client-side quality and tests. |
| DEV (backend) | [Moritz Karl Resch (mreschc)](https://profile.intra.42.fr/users/mresch), [Christoph Thaler (cthaler)](https://profile.intra.42.fr/users/cthaler), [Hüsrev Akbas - (huakbas)](https://profile.intra.42.fr/users/huakbas) | Designs and builds services/APIs, real-time game logic, auth, and infrastructure reliability. |
| DEV (database) | [Hüsrev Akbas - (huakbas)](https://profile.intra.42.fr/users/huakbas), [Christoph Thaler (cthaler)](https://profile.intra.42.fr/users/cthaler) | Owns schema/design, query performance, migrations, and data integrity/analytics pipelines. |

___

## Technical Stack:
- Frontend technologies and frameworks used.
- Backend technologies and frameworks used.
- Database system and why it was chosen.
- Any other significant technologies or libraries.
- Justification for major technical choices.

| | Tech | Description | Notes | REF |
| --- | --- | --- | --- | --- |
| **Frontend** | Vue.js |  |  | [Vue.js Docs](https://vuejs.org/guide/introduction.html) |
| **Frontend** | Bootstrap |  |  | [Bootstrap Docs](https://getbootstrap.com/docs/5.3/getting-started/introduction/), [BootstrapVue Docs](https://bootstrap-vue.org/docs/) |
| **Backend** | AdonisJS |  |  | [AdonisJS Docs](https://docs.adonisjs.com/guides/preface/introduction) |
| **Database** | PostgreSQL |  |  | [PostgreSQL Docs](https://www.postgresql.org/docs/) |
| **ORM** | Lucid ORM (AdonisJS integrated ORM) |  |  | [Lucid ORM - AdonisJS Docs](https://docs.adonisjs.com/guides/database/lucid) |

## Database Schema:
- Visual representation or description of the database structure.
- Tables/collections and their relationships.
- Key fields and data types.

## Modules:

| Module | Description | Notes | Points |
| --- | --- | --- | --- |
| Full-Stack Framework Implementation | Use a framework for both the frontend and backend.<br>◦ Use a frontend framework (React, Vue, Angular, Svelte, etc.).<br>◦ Use a backend framework (Express, NestJS, Django, Flask, Ruby on Rails, etc.).<br>◦ Full-stack frameworks (Next.js, Nuxt.js, SvelteKit) count as both if you use both their frontend and backend capabilities. | ◦ Frontend: Vue.js & Bootstrap<br>◦ Backend: AdonisJS | 2 |
| WebSocket Integration | Implement real-time features using WebSockets or similar technology.<br>◦ Real-time updates across clients.<br>◦ Handle connection/disconnection gracefully.<br>◦ Efficient message broadcasting |  | 2 |
| User Interaction System | Allow users to interact with other users. The minimum requirements are:<br>◦ A basic chat system (send/receive messages between users).<br>◦ A profile system (view user information).<br>◦ A friends system (add/remove friends, see friends list). |  | 2 |
| Public API | A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints:<br>◦ GET /api/{something}<br>◦ POST /api/{something}<br>◦ PUT /api/{something}<br>◦ DELETE /api/{something} |  | 2 |
| ORM-Based Data Access | Use an ORM for the database |  | 1 |
| Notification System | A complete notification system for all creation, update, and deletion actions. |  | 1 |
| SSR & SEO Optimization | Server-Side Rendering (SSR) for improved performance and SEO. |  | 1 |
| Online Multiplayer System | Remote players -  Enable two players on separate computers to play the same game in real-time.<br>◦ Handle network latency and disconnections gracefully.<br>◦ Provide a smooth user experience for remote gameplay.<br>◦ Implement reconnection logic. |  | 2 |
| Scalable Multiplayer System | Multiplayer game (more than two players).<br>◦ Support for three or more players simultaneously.<br>◦ Fair gameplay mechanics for all participants.<br>◦ Proper synchronization across all clients. |  | 2 |
| Data Import/Export | Data export and import functionality.<br>◦ Export data in multiple formats (JSON, CSV, XML, etc.).<br>◦ Import data with validation.<br>◦ Bulk operations support. |  | 1 |
|  |  |  | **Total:** 16 |

<details>
<summary>TO-DOs</summary>

- [ ] For Description - ADD: a clear name for the project and its key features.
- [ ] For Instructions - ADD:
    - section containing any relevant information about compilation, installation, and/or execution
    - MUST ALSO: mention all the needed prerequisites (software,tools, versions, configuration like .env setup, etc.), and step-by-step instructions to
run the project.
- [ ] For Resources: ADD: section listing classic references related to the topic (documen-tation, articles, tutorials, etc.), as well as a description of how AI was used — specifying for which tasks and which parts of the project
- [ ]  How each module was implemented.
</details>