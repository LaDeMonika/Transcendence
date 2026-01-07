COMPOSE_FILE = ./docker-compose.yml

build:
	docker compose -f $(COMPOSE_FILE) up --build

kill:
	docker compose -f $(COMPOSE_FILE) kill

down:
	docker compose -f $(COMPOSE_FILE) down

clean:
	- docker compose -f $(COMPOSE_FILE) down -v --remove-orphans
	- docker image rm $(shell docker images -q)
	- docker system prune -f

restart: clean build
