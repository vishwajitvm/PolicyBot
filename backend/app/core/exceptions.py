from fastapi import Request
from fastapi.responses import JSONResponse


class PolicyBotError(Exception):
    def __init__(self, message: str, code: str = "POLICYBOT_ERROR", status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class NotConfiguredError(PolicyBotError):
    def __init__(self, message: str):
        super().__init__(message, "NOT_CONFIGURED", 503)


class NotFoundError(PolicyBotError):
    def __init__(self, message: str):
        super().__init__(message, "NOT_FOUND", 404)


async def policybot_exception_handler(_: Request, exc: PolicyBotError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": {"code": exc.code, "message": exc.message, "details": {}}},
    )


async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {"code": "INTERNAL_SERVER_ERROR", "message": str(exc), "details": {}},
        },
    )
