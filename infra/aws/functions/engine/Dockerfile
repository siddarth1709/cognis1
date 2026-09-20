FROM public.ecr.aws/lambda/python:3.12

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy the Cognis investigation engine handler.
COPY infra/aws/functions/engine/app.py ${LAMBDA_TASK_ROOT}/app.py

# Copy the existing backend exactly as it exists in the repository.
COPY backend/ ${LAMBDA_TASK_ROOT}/backend/

# Install backend dependencies if the backend declares them.
COPY backend/requirements.txt /tmp/backend-requirements.txt
RUN if [ -s /tmp/backend-requirements.txt ]; then \
    pip install \
      --no-cache-dir \
      -r /tmp/backend-requirements.txt \
      --target "${LAMBDA_TASK_ROOT}"; \
    fi && \
    rm -f /tmp/backend-requirements.txt

CMD ["app.handler"]
