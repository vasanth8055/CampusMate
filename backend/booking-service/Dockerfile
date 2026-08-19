FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY . .

RUN cd backend && mvn -pl booking-service -am clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/backend/booking-service/target/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]