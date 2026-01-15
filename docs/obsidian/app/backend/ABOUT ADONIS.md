## ADONIS COMMANDS

**You must be in backend folder to run commands below**

1. **List of commands:**  `node ace list`
2. **See details about a command:** node ace \<command\> --help
	**Example:** `node ace migration:run --help`

## FOLDER STRUCTURE
## app/
This folder contains project logic. 
##### app/controller/
Handler functions for models. Those functions are mostly used to refer logic we apply in _start/routes.ts_.
##### app/middleware/
Middleware functions defined in this folder.
##### app/models/
Create models for Lucid ORM in order to interact with database.
##### app/validators/
Add rules to check request body if it is compatible with our models. 

## config/
Configuration files of project. Let us keep it default. Do not change as long as you don't have to.

## database/
This folder contains database setup files.
##### database/migrations/
Migration files create or alter tables. If you have relations in tables, you need right order for files. Create tables first that are required in other tables.
##### database/factories/
Factory generates example entries for a model. Use factories in seeder to add fake records into database. Makes it easier to test
##### database/seeder/
You can add data into database right after creating tables. You can use factory to generate data.

## start/
Files and variables that Adonis register or load first place.
##### start/env.ts
Defines or extracts environment variables used in project.
##### start/kernel.ts
Define global handlers and middlewares.
##### start/routes.ts
Define and handle API endpoints. You can also assign a handler for routes.

## tests/
You can add test cases and run it with a single command.
But I prefer and recommend to test with [playwright](https://playwright.dev/), which is popular and have a lot of capabilities. 