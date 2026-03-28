# 🚀 PulseNet — Microservices Social Media Platform

![TDD](https://img.shields.io/badge/TDD-Red%20Green%20Refactor-brightgreen)
![.NET](https://img.shields.io/badge/.NET-8.0-blueviolet)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-orange)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

PulseNet, merkezinde uçtan uca yönetilen bir Dispatcher (API Gateway) olan; tamamen bağımsız ve izole mikroservislerin birbiriyle konuştuğu **TDD (Test-Driven Development)** prensipleriyle geliştirilmiş modern bir sosyal medya platformu simülasyonudur. Proje, monolitik yapıların ölçeklenme ve hata yönetimi problemlerini ortadan kaldırmak için tasarlanmıştır.

## 🏗️ Sistem Mimarisi

Dış dünyadan gelen tüm istekler, Network Isolation (Ağ İzolasyonu) kuralları gereği *yalnızca* Dispatcher üzerinden geçer ve ilgili iç mikroservise güvenli bir şekilde aktarılır.

```mermaid
graph TD
    Client([Dış İstemciler - Web/Mobil]) -->|HTTP :8080| Gateway[Dispatcher / API Gateway]
    
    subgraph internal_net [İzole İç Ağ / Network Isolation]
        Gateway -->|X-Internal-Gateway| Auth[Auth Service :5001]
        Gateway -->|X-Internal-Gateway| Users[User Service :5002]
        Gateway -->|X-Internal-Gateway| Posts[Post Service :5003]
        Gateway -->|X-Internal-Gateway| Follow[Follow Service :5004]
        Gateway -->|X-Internal-Gateway| Timeline[Timeline Service :5005]
        
        Auth --> DB1[(MongoDB - Auth)]
        Users --> DB2[(MongoDB - Users)]
        Posts --> DB3[(MongoDB - Posts)]
        Follow --> DB4[(MongoDB - Follows)]
        Timeline --> DB5[(MongoDB - Timeline)]
    end

    style Gateway fill:#f96,stroke:#333,stroke-width:2px
    style internal_net fill:#f4f4f4,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
```
