stage = local production
.PHONY: $(stage)

$(stage): ## stage=[local, production], run docker compose with different stage
	@docker-compose -f docker-compose.$@.yml build --no-cache;

	@if [ "$(@)" = "local" ]; then\
		docker-compose -f docker-compose.$@.yml up;\
	else\
		docker-compose -f docker-compose.$@.yml up -d --remove-orphans --force-recreate;\
	fi

test_api: ## Run newman to test API
	@cd api/ && yarn newman run ./src/config/newman.json && cd ..

clear_db: ## Remove the db folder
	@rm -r db

exec_api: ## Interactive with the api container
	@docker exec -it $(shell docker ps -a -q --filter ancestor=lottery-system --format="{{.ID}}") sh

HELP_CMD = grep -E '.*?\#\# .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?\#\# "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
help:
	@${HELP_CMD}