🔥 HESTIA : Wildfire Monitoring Backend – Project Overview

This backend powers an IoT-based real-time wildfire monitoring system designed to reduce response time and damage from natural fires in Denmark. With droughts and wildfire risks increasing due to climate change, this solution uses a network of smart sensors to detect early signs of fire.

The system collects and processes data from multiple sources:

    Temperature sensors

    Soil moisture sensors

    Smoke detectors

    Visual cameras

Using this data, the system identifies high-risk areas and triggers early warnings to emergency services. Additionally, it stores environmental data for long-term analysis and research in climate, nature conditions, and fire behavior.


# 📦 MongoDB Schema Documentation

This document outlines the structure of each collection in the MongoDB database.

---

## 📬 notifications

| Field            | Types     | Description          |
|------------------|-----------|----------------------|
| `_id`            | object    | MongoDB ObjectId     |
| `UniqueIdentifier` | string    | Unique ID            |
| `IsRead`         | boolean   | Read status          |
| `Title`          | string    | Notification title   |
| `SubTitle`       | string    | Notification subtitle|
| `Type`           | number    | Notification type    |
| `DateCreated`    | string    | Creation timestamp   |


---

## 🖥 devices

| Field              | Types             | Description                   |
|--------------------|------------------|-------------------------------|
| `_id`              | object           | MongoDB ObjectId              |
| `PIUniqueIdentifier` | string          | Unique ID for the device      |
| `PIDisplayName`    | string           | Human-readable name           |
| `Ip`               | string           | IP address                    |
| `Port`             | number           | Port number                   |
| `Mac`              | string           | MAC address                   |
| `Latitude`         | number           | GPS latitude                  |
| `Longitude`        | number           | GPS longitude                 |
| `Version`          | string           | Software version              |
| `Sensors`          | array, object    | Associated sensors            |
| `Mode`             | number           | Operating mode                |
| `LastHeartbeat`    | string, object   | Last ping/heartbeat info      |

---

## 🌡 sensors

| Field                   | Types   | Description                       |
|-------------------------|---------|-----------------------------------|
| `_id`                   | object  | MongoDB ObjectId                  |
| `SensorUniqueIdentifier`| string  | Unique ID for the sensor          |
| `PIUniqueIdentifier`    | string  | Associated device ID              |
| `Type`                  | number  | Sensor type (e.g. temperature)    |
| `TimeStamp`             | string  | Time of reading                   |
| `Data`                  | object  | Sensor data payload               |

---

## 👤 users

| Field         | Types   | Description                        |
|---------------|---------|------------------------------------|
| `_id`         | object  | MongoDB ObjectId                   |
| `username`    | string  | Username                           |
| `password`    | string  | Hashed password                    |
| `email`       | string  | Email address                      |
| `firstname`   | string  | First name                         |
| `lastname`    | string  | Last name                          |
| `role`        | number  | User role (e.g. admin, user)       |
| `createdAt`   | string  | Account creation time              |
| `lastActiveAt`| string  | Last time user was active          |
| `lockedUntil` | object  | Lockout time (if user is blocked)  |
| `loginAttempts`| number | Number of failed login attempts    |
| `updatedAt`   | string  | Last update timestamp              |

---



. 
