FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# generate data & train model at build time (so the container has the model)
RUN python generate_synthetic_data.py && python train_model.py
EXPOSE 5001
CMD ["python", "predict.py"]
