# **Bulk QR Code Generator**

A high-performance **bulk QR code generation system** built with **Express.js**, **BullMQ**, **Redis**, **MySQL**, **Rate Limiting**, and **Nodemailer**. This application allows you to create, manage, and track thousands of QR codes efficiently while ensuring scalability and fault tolerance.

---

## **Features**
- ✔ **Bulk QR Code Generation** – Create hundreds or thousands of QR codes in one go  
- ✔ **Asynchronous Processing with BullMQ** – Job queues for scalable and reliable task handling  
- ✔ **Redis Caching** – Fast progress tracking and queue state management  
- ✔ **MySQL Database** – Persistent storage for QR code data and batch details  
- ✔ **Rate Limiting** – Prevent abuse and control request traffic  
- ✔ **Email Notifications with Nodemailer** – Notify users about batch processing status  
- ✔ **Progress Tracking** – Real-time status of each batch (completed, failed, pending)  
- ✔ **Error Handling & Retry** – Automatic retries for failed jobs  

---

## **Tech Stack**
- **Backend:** Node.js (Express.js)
- **Queue Management:** [BullMQ](https://docs.bullmq.io/)
- **Cache & Queue Storage:** Redis
- **Database:** MySQL
- **Email Service:** Nodemailer
- **Rate Limiting:** Express Rate Limit
- **QR Code Generation:** `qrcode` 
- **Cloudinary:** For storing file

---

## **Architecture Overview**
1. **API Request** → User submits a bulk QR generation request with metadata (e.g., number of QR codes, template, etc.)
2. **Job Creation** → Request is added to a **BullMQ queue**.
3. **Workers** → A BullMQ worker processes jobs asynchronously, generating QR codes and saving data to **MySQL**.
4. **Progress Tracking** → Each batch progress is stored in **Redis** (`completed`, `failed`, `pending`).
5. **Rate Limiter** → Protects the API from abuse and high traffic.
6. **Email Notification** → Once a batch completes, the user receives an email with details or download links.


---

## **Installation & Setup**
### **1. Clone the repository**
```bash/
git clone https://github.com/your-username/bulk-qr-generator.git
cd bulk-qr-generator

npm install

Env:
REDIS_HOST=
DB_HOST=
DB_NAME=
DB_USER=
DB_USERNAME=
DB_PASSWORD=
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=  
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

