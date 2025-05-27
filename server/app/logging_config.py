# F:\Education\OOP\shadow_link\server\app\logging_config.py
import os
import logging
import structlog
from socket import socket, AF_INET, SOCK_STREAM

class LogstashJSONHandler(logging.Handler):
    def __init__(self, host, port):
        super().__init__()
        self.host, self.port = host, port

    def emit(self, record):
        try:
            msg = self.format(record) + "\n"
            sock = socket(AF_INET, SOCK_STREAM)
            sock.connect((self.host, self.port))
            sock.sendall(msg.encode("utf-8"))
            sock.close()
        except Exception:
            pass

def configure_logging(host=None, port=None):
    host = host or os.getenv("LOGSTASH_HOST", "logstash")
    port = port or int(os.getenv("LOGSTASH_PORT", 5000))

    logging.basicConfig(level=logging.INFO, format="%(message)s")
    handler = LogstashJSONHandler(host, port)
    handler.setFormatter(logging.Formatter("%(message)s"))
    logging.getLogger().addHandler(handler)

    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.stdlib.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        cache_logger_on_first_use=True,
    )
