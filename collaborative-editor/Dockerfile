# Build stage: Maven + Java 21 used to build the Spring Boot JAR
FROM maven:3.9-eclipse-temurin-21 AS build

# Set working directory inside the container
WORKDIR /app

# Copy Maven configuration
COPY pom.xml .

# Copy Spring Boot source code
COPY src ./src

# Build the JAR without running tests
RUN mvn clean package -DskipTests


# Runtime stage: only Java 21 JRE is needed to run the application
FROM eclipse-temurin:21-jre

# Set working directory
WORKDIR /app

# Copy the JAR created in the build stage
COPY --from=build /app/target/*.jar app.jar

# Document that the application uses port 8080
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]