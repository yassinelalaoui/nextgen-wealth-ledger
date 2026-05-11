FROM openjdk:21-jdk-slim as builder

WORKDIR /app

# Copy Maven wrapper files
COPY .mvn .mvn
COPY pom.xml .
COPY mvnw .

# Copy source code
COPY src src

# Build the application
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

# Runtime stage
FROM openjdk:21-jdk-slim

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD java -jar app.jar || exit 1

# Expose port
EXPOSE 8085

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
