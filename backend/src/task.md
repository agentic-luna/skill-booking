# Task List: Database-Agnostic & API Layer Refactoring

- [ ] Define pure TS Domain Entities (`src/domain/entities/`)
- [ ] Update Domain Repository Interfaces to refer only to pure entities (removing Prisma imports)
- [ ] Implement Prisma -> Domain entity mappers
- [ ] Refactor Prisma Repositories to map database rows to Domain Entities before returning them
- [ ] Relocate Express files from `src/infrastructure/web/` to `src/api/` (controllers, routes, middlewares, app.ts)
- [ ] Redirect `src/app.ts` to export from `src/api/app.ts`
- [ ] Update Seeder and API test files to point to the new paths
- [ ] Resolve TypeScript type mismatches and verify code compiles cleanly
- [ ] Run the automated test suite to ensure all operations function perfectly
- [ ] Remove the obsolete `src/infrastructure/web/` folder
