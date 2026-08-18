import os

# Keep the suite in a predictable environment.
os.environ.setdefault("ENV", "dev")

# The OpenAI plugin validates that an API key is present at construction, so
# build_pool() and any agent boot test need one. CI has no real secret, so seed a
# harmless placeholder (setdefault never overrides a real key).
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
