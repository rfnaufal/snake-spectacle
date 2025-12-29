.PHONY: install-backend run-backend

install-backend:
	cd backend && uv sync

run-backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

test-backend:
	cd backend && make test
