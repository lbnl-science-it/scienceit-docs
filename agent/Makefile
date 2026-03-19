# Build agent.yaml from agent-template.yaml by substituting environment variables.
# The template uses ${SCIENCEIT_DOCS_BASEDIR} which envsubst expands at build time.

SHELL := /bin/bash

AGENT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
BASEDIR   := $(abspath $(AGENT_DIR)/..)

TEMPLATE := $(AGENT_DIR)/agent-template.yaml
TARGET   := ${HOME}/.lrc-agent/agent.yaml

DB_FILES := \
	${HOME}/.lrc-agent/scienceit-docs-chunked-embeddings.db \
	${HOME}/.lrc-agent/scienceit-docs-bm25.db

.PHONY: all agent.yaml update clean help

all: agent.yaml

# --- Build agent.yaml from template ---

agent.yaml: $(TARGET)

$(TARGET): $(TEMPLATE)
	@if [ -z "$$SCIENCEIT_DOCS_BASEDIR" ]; then \
		export SCIENCEIT_DOCS_BASEDIR="$(BASEDIR)"; \
	fi; \
	mkdir -p ${HOME}/.lrc-agent
	envsubst '$$SCIENCEIT_DOCS_BASEDIR $$HOME' < "$<" > "$@"
	@echo "Generated $@ (SCIENCEIT_DOCS_BASEDIR=$${SCIENCEIT_DOCS_BASEDIR:-$(BASEDIR)})"

# --- Git update check and RAG database refresh ---

update:
	@cd "$(BASEDIR)" && git fetch --quiet 2>/dev/null; \
	local_rev=$$(git -C "$(BASEDIR)" rev-parse HEAD 2>/dev/null); \
	remote_rev=$$(git -C "$(BASEDIR)" rev-parse '@{u}' 2>/dev/null); \
	if [ $$? -ne 0 ]; then \
		echo "No upstream configured; skipping update check."; \
		exit 0; \
	fi; \
	if [ "$$local_rev" = "$$remote_rev" ]; then \
		echo "Already up to date."; \
		exit 0; \
	fi; \
	echo "Updates are available for the scienceit-docs repository."; \
	writable=true; \
	mkdir -p ${HOME}/.lrc-agent \
	for db in $(DB_FILES); do \
		if [ -e "$$db" ] && [ ! -w "$$db" ]; then \
			writable=false; \
			break; \
		fi; \
		if [ ! -e "$$db" ]; then \
			parent=$$(dirname "$$db"); \
			if [ ! -w "$$parent" ]; then \
				writable=false; \
				break; \
			fi; \
		fi; \
	done; \
	if [ "$$writable" = "false" ]; then \
		echo "Ask a system administrator to update the lrc-agent database."; \
		exit 0; \
	fi; \
	read -rp "Pull updates and reset the RAG databases? [y/N] " answer; \
	case "$$answer" in \
		[Yy]) \
			for db in $(DB_FILES); do \
				rm -f "$${db}-old"; \
				if [ -e "$$db" ]; then \
					mv -f "$$db" "$${db}-old"; \
					echo "  Backed up $$(basename $$db) -> $$(basename $$db)-old"; \
				fi; \
			done; \
			cd "$(BASEDIR)" && git pull --ff-only; \
			if [ $$? -ne 0 ]; then \
				echo "Warning: git pull failed. Database files have been backed up."; \
				echo "You may need to resolve conflicts manually."; \
				exit 1; \
			fi; \
			echo "  Repo updated. RAG databases will be rebuilt on next agent run."; \
			$(MAKE) -f $(AGENT_DIR)/Makefile agent.yaml ;; \
		*) \
			echo "Skipped." ;; \
	esac

# --- Cleanup ---

clean:
	rm -f $(TARGET)

help:
	@echo "Targets:"
	@echo "  agent.yaml  Build agent.yaml from agent-template.yaml (default)"
	@echo "  update      Check for repo updates, pull, and reset RAG databases"
	@echo "  clean       Remove generated agent.yaml"
	@echo "  help        Show this message"
