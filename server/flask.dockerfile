FROM python:3.13-slim

WORKDIR /app

# Копируем только requirements
COPY server/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код сервера
COPY server/ .

EXPOSE 4000

ENV FLASK_APP=run
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=4000

CMD ["flask", "run"]
