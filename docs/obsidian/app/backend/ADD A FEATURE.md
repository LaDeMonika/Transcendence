**1. Create migration:**
- Run `node ace make:migration <modelName>`
- Set rules in /database/migrations/\<generatedFile\>
- This is used to create table in database. 
- WARNING: You should run `node ace migration:run` in order to create newly added tables.

**2. Create model file:**
- Run `node ace make:model <modelName>`
- Declare attributes corresponding to columns of table.
- We can use model to interact database through Lucid ORM.

**3. Create controller:**
- Run `node ace make:controller <modelName>`
- Define functions depends on need.
_(index, store, show, update, destroy). These are default function names in Adonis for requests. We can use other function names that we all understand the same._
- Add swagger commends , so our /docs works structured. Example: 
`/**`
`* @store` : function name
`* @tag testuser` : tag is used to group methods
`* @description Store a record` : simple definition of what happens in the function
`* @requestBody:<testuserValidator>`: shows an example of expected request body
`*/`
- Implement logic

**4. Add routes to /app/start/routes.ts**
- Add required routes. See following lines as example. For details check documentation.
`router
	`.group(() => {
	`router.get('/', [<controllerClass>, '<handlerFunction>>'])
	`router.post('/', [<controllerClass>, '<handlerFunction>'])
	`router.put('/', [<controllerClass>, '<handlerFunction>'])
	`router.get('/:id', [<controllerClass>, '<handlerFunction>'])
	`router.delete('/:id', [<controllerClass>, '<handlerFunction>'])
`})
`.prefix('/<modelName>')

**5. Be sure it works**
- See swagger documentation if routes and handler functions are right.
- Try to add, list and remove records.

**6. Commit your work before it is too late**
