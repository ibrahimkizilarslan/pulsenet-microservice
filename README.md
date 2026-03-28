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

### ✨ Öne Çıkan Özellikler

- **Gelişmiş Dispatcher (API Gateway):** YARP gibi hazır bir kütüphane kullanılmadan, TDD döngüsüyle sıfırdan yazılmış merkezi yönlendirme ve JWT doğrulama arayüzü. İstenmeyen hatalar yakalanarak spesifik HTTP hata kodları (4xx, 5xx vb.) döndürülür.
- **RESTful & RMM Seviye 2:** Tüm endpoint'ler Richardson Olgunluk Modeli (RMM) Seviye 2 standartlarına sıkı sıkıya bağlıdır. İşlemler parametrelerden değil (`?delete=userId`), doğrudan kaynak URI'lerinden ve anlamlı HTTP metotlarından (GET, POST, PUT, DELETE) yapılır.
- **Database-per-service (İzole Veritabanı):** Her mikroservisin veri yapıları birbirine karışmaması adına kendine ait bağımsız bir NoSQL (MongoDB) veritabanı bulunur.
- **Güvenlik (Network Isolation):** Mikroservisler dışarıya doğrudan kapalı tutulmuştur. İstemciden veriyi gizlemek adına yalnızca Dispatcher'ın yönlendirdiği (header'ında yetki taşıyan) bağlantıları dinler.
- **JSON Standardı:** İstemci, API Gateway ve Mikroservisler arası tüm veri aktarımı tamamen JSON formatında yapılır. OOP ve SOLID kuralları titizlikle uygulanır.

---

## 🚦 İstek Yaşam Döngüsü

İstemcinin bir kaynağa (örnek: yeni post paylaşımı) yetki aldıktan sonra nasıl eriştiğini gösteren request flow diyagramı:

```mermaid
sequenceDiagram
    participant Client as İstemci
    participant Gateway as Dispatcher (Gateway)
    participant Target as Post Service
    participant DB as MongoDB (Post DB)
    
    Client->>Gateway: POST /api/auth/login
    Gateway-->>Client: 200 OK (JWT Token)

    Client->>Gateway: POST /api/posts (Bearer JWT)
    Gateway->>Gateway: Tek Merkezden JWT Kontrolü
    alt Hatalı/Yetersiz Yetki
        Gateway-->>Client: 401 Unauthorized / JSON Error
    else Başarılı Doğrulama
        Gateway->>Target: İlet (X-Internal-Gateway Korumasıyla)
        Target->>DB: JSON Verisini Ekle
        DB-->>Target: Başarılı
        Target-->>Gateway: 201 Created
        Gateway-->>Client: 201 Created
    end
```

---

## 🚀 Başlangıç & Kurulum

Proje **Docker Compose** ortamına tam uyumlu olup, tek bir terminal komutuyla tüm ağ birimleriyle birlikte başlatılabilmektedir.

### Ön Koşullar
- Docker & Docker Compose
- .NET 8 SDK (Geliştirme ve unit testler için)

### Projeyi Ayağa Kaldırma

```bash
cd infra
docker-compose up --build
```
*Sistem ayağa kalktıktan sonra Dispatcher (Gateway) dış dünyaya `http://localhost:8080` üzerinden hizmet verecektir.*

---

## 🧪 Testler ve Performans

### TDD (Test-Driven Development)
Projedeki en kritik parça olan Dispatcher servisinde kod kalitesini artırmak ve hata payını minimize etmek için süreç **TDD (Red-Green-Refactor)** ile ilerletilmiştir. xUnit ile yazılan testler uygulamadan bağımsız olarak çalıştırılabilir:

```bash
dotnet test tests/PulseNet.Gateway.Tests/PulseNet.Gateway.Tests.csproj
```

### 📊 Grafana İzleme ve Yük Testleri
Mimarinin yoğun trafiğe karşı dayanıklılığını ölçmek adına profesyonel araçlarla simülasyonlar (JMeter, k6 veya Locust vb.) gerçekleştirilmektedir.

- **Loglama ve Görselleştirme:** Dispatcher üzerinden geçen trafik akışı Grafana aracılığıyla (`localhost:3000`) grafiksel arayüze taşınmıştır.
- Performans testlerine ait gecikme (ms) ve hata oranları proje geliştirme fazları ardında repo içerisine konumlandırılacaktır.

---

## 📸 Ekran Görüntüleri ve Çıktılar

Aşağıda projemizin çeşitli özelliklerine, mimari katmanlarına ve test süreçlerine ait ekran görüntüleri bulunmaktadır. Görseller, ilgili oldukları kavramlara göre kategorize edilmiştir.

### 🛡️ Mikroservis İzolasyonu ve Güvenlik
Ağ İzolasyonu (Network Isolation) ve API Gateway üzerindeki güvenlik önlemleri:
- **Mikroservis İzolasyonu ve Güvenlik 1:**
  ![Mikroservis İzolasyonu ve Güvenlik 1](images/Mikroservis%20%C4%B0zolasyonu%20ve%20G%C3%BCvenlik/Mikroservis%20%C4%B0zolasyonu%20ve%20G%C3%BCvenlik%201.jpeg)
- **Mikroservis İzolasyonu ve Güvenlik 2:**
  ![Mikroservis İzolasyonu ve Güvenlik 2](images/Mikroservis%20%C4%B0zolasyonu%20ve%20G%C3%BCvenlik/Mikroservis%20%C4%B0zolasyonu%20ve%20G%C3%BCvenlik%202.jpeg)

### 📈 Richardson Olgunluk Modeli (RESTful API)
RMM Seviye 2 standartlarına sıkı sıkıya bağlı kalınarak oluşturulan API uç noktaları ve HTTP operasyonları:
- **Oluşturma (Create Post):**
  ![Create Post](images/Richardson%20Olgunluk%20Modeli/Create%20Post%20.jpeg)
- **Listeleme (Tüm Postları Listeleme):**
  ![Tüm Postları Listeleme](images/Richardson%20Olgunluk%20Modeli/T%C3%BCm%20Postlar%C4%B1%20Listeleme,.jpeg)
- **Güncelleme (Kayıt Güncelleme):**
  ![Kayıt Güncelleme](images/Richardson%20Olgunluk%20Modeli/Kay%C4%B1t%20G%C3%BCncelleme.jpeg)
- **Silme (Delete Post):**
  ![Delete Post](images/Richardson%20Olgunluk%20Modeli/Delete%20Post.jpeg)
- **Hata Yönetimi (Error Handling):**
  ![Hata Yönetimi](images/Richardson%20Olgunluk%20Modeli/Hata%20Y%C3%B6netimi.jpeg)

### 🗄️ Veri İzolasyonu (Database-per-service)
Her mikroservisin kendi verilerini yönettiği izole veri mimarisi (NoSQL - MongoDB):
- **Veri İzolasyonu:**
  ![Veri İzolasyonu](images/Veri%20%C4%B0zolasyonu%20(NoSQL).jpeg)

### 🧪 TDD ve Birim Testler
Red-Green-Refactor test döngüsü ve Gateway için yazılmış birim test sonuçları:
- **TDD ve Birim Testler:**
  ![TDD ve Birim Testler](images/TDD%20ve%20Birim%20Testler.jpeg)

### 📊 İzleme ve Yük Testleri
Sistem performansını, eş zamanlı yük kapasitesini ve metrikleri izleme araçları:
- **Grafana Dashboard:**
  ![Grafana](images/Grafana.jpeg)
- **Prometheus Entegrasyonu:**
  ![Prometheus](images/Prometheus.jpeg)
- **K6 Yük Testi:**
  ![K6](images/K6.jpeg)

---

## 👥 Ekip

- **[İbrahim Kızılarslan]**
- **[Cihat Karataş]**

---

**Özet / Sonuç:** 
Bu projede katmanlı ve monolitik yaklaşımlardan uzaklaşılarak, her bir modülün OOP mantığına uygun birer ünite/servis olarak bağlandığı; yönetimi, ölçeklenmesi ve bakımı kolay temiz bir mimari (Clean Architecture) kurgulanmıştır. Sonraki aşamalarda sistem RabbitMQ/Kafka gibi Message Broker’lar ile desteklenerek asenkron modellere entegre edilebilir.
