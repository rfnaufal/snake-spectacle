run:
	uv run uvicorn app.main:app --reload --port 8000

test:
	rm -f test.db
	DATABASE_URL=sqlite:///./test.db uv run pytest
	rm -f test.db
