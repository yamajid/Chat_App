D-C = docker compose
C-F = docker-compose.yml


all: up

.PHONY: up down ps shell-backend shell-nginx shell-frontend shell-redis clean  fclean
up:
	$(D-C) -f $(C-F) up --build

down:
	$(D-C) -f $(C-F) down -v

ps:
	$(D-C) -f $(C-F) ps

shell-backend:
	$(D-C) -f $(C-F) exec backend bash

shell-nginx:
	$(D-C) -f $(C-F) exec nginx bash

shell-frontend:
	$(D-C) -f $(C-F) exec  frontend bash

shell-redis:
	$(D-C) -f $(C-F) exec  redis bash

clean:
	$(D-C) -f $(C-F) down --volumes --remove-orphans



fclean: 
	docker system prune -a --volumes