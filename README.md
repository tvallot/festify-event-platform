# Festify - Plateforme de Gestion d'Événements

**Festify** est une application Full Stack moderne permettant de découvrir, créer, gérer et participer à des événements (concerts, festivals, communautés). Le projet intègre une architecture Spring Boot / React avec une chaîne CI/CD complète.

---

## Lien Utile
* **Lien de démonstration (VM) :** [http://192.168.75.101](http://192.168.75.101)

---

## Dépendances et Technologies

### Backend (`/backend`)
- **Java 21** (Eclipse Temurin)
- **Spring Boot 3.4.5** (Starter Web, Data JPA)
- **PostgreSQL 15** (Base de données relationnelle)
- **jBCrypt 0.4** (Sécurité et hachage des mots de passe)
- **Maven 3.9+** (Gestionnaire de dépendances et build)

### Frontend (`/frontend`)
- **React 19** & **Vite 7**
- **Tailwind CSS 4** (Stylage moderne)
- **Redux Toolkit** (Gestion de l'état global)
- **React Router 7** (Navigation SPA)
- **Axios** (Requêtes HTTP vers l'API)

---

## Procédure de Build

### 1. Préparation de l'environnement
Avant tout build, créez un fichier `.env` à la racine du backend (sur le modèle de `.env.example`) :
```env
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=festify
DATABASE_URL=jdbc:postgresql://db:5432/festify
```

### 2. Build et Lancement avec Docker (Recommandé)
Pour construire les images et lancer l'ensemble des services (Base de données, API, et Client Nginx) :
```bash 
docker-compose up --build
```
Frontend : Accessible sur http://localhost:80

### Build Manuel (Développement)
Backend :
```bash 
cd backend/festify
./mvnw clean package -DskipTests
java -jar target/festify-0.0.1-SNAPSHOT.jar
```

Frontend :
```bash
cd frontend
npm install
npm run build
npm run dev
```

### CI/CD (GitLab)
Le projet utilise GitLab CI (.gitlab-ci.yml) pour automatiser :

Build Stage : Compilation du JAR Backend et création du bundle statique Frontend (dist/).

Test Stage : Analyse de la qualité via SonarQube (SonarScanner).

Deploy Stage : - Transfert automatique vers la VM (192.168.75.101) via SSH.
               - Gestion du processus Backend par PM2.
               - Déploiement du Frontend via Nginx.
