PORT ?= /dev/cu.usbmodem2102

.PHONY: free-serial
free-serial:
	@pids=$$(lsof -t $(PORT) 2>/dev/null); \
	if [ -z "$$pids" ]; then \
		echo "No process using $(PORT)"; \
	else \
		echo "Killing $$pids using $(PORT)"; \
		kill -9 $$pids; \
	fi

.PHONY: start
start:
	npm start -- $(ARGS)
