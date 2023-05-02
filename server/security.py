import os
from hashlib import pbkdf2_hmac as hmac

SALT = os.environ.get("CRYPT_SALT", "ough salty").encode("utf-8")
ITER = int(os.environ.get("CRYPT_ITERATIONS", "500000"))


def password_gen(password: str) -> str:
    return hmac("sha256", password.encode("utf-8"), SALT, ITER).hex()
