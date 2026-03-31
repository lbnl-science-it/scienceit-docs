# Build agent.yaml from agent-template.yaml by substituting environment variables.
# The template uses ${SCIENCEIT_DOCS_BASEDIR} which envsubst expands at build time.

SHELL := /bin/bash

AGENT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
BASEDIR   := $(abspath $(AGENT_DIR)/..)

TEMPLATE := $(AGENT_DIR)/agent-template.yaml
TARGET   := $(AGENT_DIR)/agent.yaml
LRC_DOCS_FILE := $(AGENT_DIR)/llms-lrc.txt

LRC_DOCS_SOURCES := $(shell find $(BASEDIR)/docs/hpc $(BASEDIR)/docs/data $(BASEDIR)/docs/help -name "*.md" -print | sort)

.PHONY: all agent.yaml update clean help

all: agent.yaml $(LRC_DOCS_FILE)

# --- Build agent.yaml from template ---

agent.yaml: $(TARGET)

$(LRC_DOCS_FILE): $(LRC_DOCS_SOURCES)
	@{ for f in $^; do \
		echo "<!-- Source: $${f#$(BASEDIR)/} -->"; \
		cat "$$f"; \
		echo; \
	done; } > $@
	@echo "Generated $@ ($(words $^) doc files)"

$(TARGET): $(TEMPLATE)
	@if [ -z "$$SCIENCEIT_DOCS_BASEDIR" ]; then \
		export SCIENCEIT_DOCS_BASEDIR="$(BASEDIR)"; \
	fi; \
	envsubst '$$SCIENCEIT_DOCS_BASEDIR' < "$<" > "$@"
	@echo "Generated $@ (SCIENCEIT_DOCS_BASEDIR=$${SCIENCEIT_DOCS_BASEDIR:-$(BASEDIR)})"

# --- Git update check and docs refresh ---

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
	read -rp "Pull updates and rebuild? [y/N] " answer; \
	case "$$answer" in \
		[Yy]) \
			cd "$(BASEDIR)" && git pull --ff-only; \
			if [ $$? -ne 0 ]; then \
				echo "Warning: git pull failed."; \
				echo "You may need to resolve conflicts manually."; \
				exit 1; \
			fi; \
			echo " Repo updated. Rebuilding config and docs...";\
			$(MAKE) -f $(AGENT_DIR)/Makefile ;; \
		*) \
			echo "Skipped." ;; \
	esac

# --- Cleanup ---

clean:
	rm -f $(TARGET) $(LRC_DOCS_FILE)

help:
	@echo "Targets:"
	@echo "  agent.yaml  Build agent.yaml from agent-template.yaml (default)"
	@echo "  update      Check for repo updates, pull, and reset RAG databases"
	@echo "  clean       Remove generated agent.yaml"
	@echo "  help        Show this message"
