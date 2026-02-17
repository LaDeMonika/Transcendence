COMPOSE_FILE = ./docker-compose.yml

all: build

ssl-cert:
	mkdir -p docker/nginx/ssl
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout docker/nginx/ssl/private.key \
		-out docker/nginx/ssl/certificate.crt \
		-subj "/C=AT/ST=Austria/L=Vienna/O=42/CN=localhost"

build:	ssl-cert
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
