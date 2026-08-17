FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY . .
RUN mvn -pl admin-service -am -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/admin-service/target/*.jar app.jar

EXPOSE 8089

ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]