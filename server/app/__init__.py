import os
import uuid
from flask import Flask, Response
from app.logging_config import configure_logging
from app.extensions import db, bcrypt, login_manager, cors, jwt
from app.routes.auth import auth_bp
from app.routes.users import users_bp
from app.routes.admin import admin_bp
from app.routes.servers import server_bp
from app.routes.user_configurations import user_configurations_bp
from app.models.user import User

# OpenTelemetry imports
from opentelemetry import trace, metrics
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.flask import FlaskInstrumentor as FlaskMetricsInstrumentor
from opentelemetry.instrumentation.celery import CeleryInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor

from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

# --- OpenTelemetry Setup (tracing + metrics) ---

resource = Resource.create({
    "service.name": os.getenv("OTEL_SERVICE_NAME", "flaskapp")
})

# Tracing
trace_provider = TracerProvider(resource=resource)
jaeger_exporter = JaegerExporter(
    agent_host_name=os.getenv("OTEL_EXPORTER_JAEGER_AGENT_HOST", "localhost"),
    agent_port=int(os.getenv("OTEL_EXPORTER_JAEGER_AGENT_PORT", "6831"))
)
trace_provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
trace.set_tracer_provider(trace_provider)

# Metrics
prom_reader = PrometheusMetricReader()
meter_provider = MeterProvider(metric_readers=[prom_reader])
metrics.set_meter_provider(meter_provider)

# Instrument DB and other libraries globally (до создания app)
Psycopg2Instrumentor().instrument()
SQLAlchemyInstrumentor().instrument()
CeleryInstrumentor().instrument()
RedisInstrumentor().instrument()

# -------------------------------------------------------------

def create_app():
    app = Flask(__name__)

    app.config.from_object('config.Config')

    configure_logging(
        host=app.config['LOGSTASH_HOST'],
        port=app.config['LOGSTASH_PORT']
    )

    FlaskInstrumentor().instrument_app(app)
    FlaskMetricsInstrumentor().instrument_app(app)

    # Инициализация расширений
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    cors.init_app(
        app,
        origins=[app.config.get('CORS_ORIGINS', 'http://localhost:3000')],
        supports_credentials=True
    )
    jwt.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = app.config.get('CORS_ORIGINS', 'http://localhost:3000')
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

    @app.route("/metrics")
    def metrics_endpoint():
        return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(server_bp)
    app.register_blueprint(user_configurations_bp)

    with app.app_context():
        db.create_all()

    return app
