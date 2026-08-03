FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8087

ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]