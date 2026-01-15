## Current State 

1. **Start database:** Run `make` command in project root directory. It starts PostgreSQL in docker ( *localhost:5432* ). Adonis environment variables are already set and works with current database.
2. **Start back end server:** 
	- Change directory into *srcs/backend*.
	- Run `node ace migration:run`. This command creates database tables. Ignores migration if database tables are already created. If you want to remove old tables run `node ace migration:fresh`. This command drops all tables and creates brand new tables.
	- Run `node ace serve` command to start backend service (*localhost:3333* ). 
3. **Check if server started:** Open your favorite browser and go to *localhost:3333*. If you see a welcome message, means it works fine.
4. **See API list:** Go to *localhost:3333/docs*
