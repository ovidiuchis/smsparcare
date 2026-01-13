# SMS Parcare Cluj – Aplicație Web

O aplicație web minimalistă și modernă (Single Page Application) pentru generarea rapidă a mesajelor SMS de plată a parcării în Cluj-Napoca.

## 🎯 Scop
Scopul proiectului este de a simplifica procesul de plată a parcării, eliminând necesitatea de a memora codurile (403, 404 etc.) sau de a reintroduce numărul de înmatriculare de fiecare dată. Aplicația este construită "Mobile First" și funcționează direct în browser, fără instalare.

## ✨ Funcționalități Cheie
- **Selectare Zonă**: Comutare rapidă între Zona I și Zona II.
- **Calcul Automat**: Prețul și codul SMS se actualizează instant în funcție de durată.
- **Salvare Numere**: Numerele de înmatriculare sunt salvate local (`localStorage`) pentru reutilizare rapidă.
- **Offline Ready**: Funcționează și fără conexiune la internet (după prima încărcare).
- **Deep Linking SMS**: Deschide direct aplicația de mesagerie a telefonului cu destinatarul (`7480`) și textul completat.
- **Design Premium**: Interfață curată, modernă, cu suport pentru Dark Mode.

## 🛠️ Tehnologii
Proiectul este realizat folosind tehnologii web standard, fără framework-uri sau dependințe externe, pentru viteză maximă și simplitate:
- **HTML5**: Semantic și accesibil.
- **CSS3**: Variabile CSS, Flexbox/Grid, animații și efecte Glassmorphism.
- **Vanilla JavaScript**: Logică ușoară, fără biblioteci inutile.

## 🚀 Cum se folosește
1. Deschide fișierul `index.html` în orice browser modern (Chrome, Safari, Firefox).
2. Selectează **Zona** (I sau II).
3. Alege **Durata** dorită (ex: 30 min, 1 oră...).
4. Introdu **Numărul de Înmatriculare** (sau alege unul salvat).
5. Apasă **Trimite SMS** – se va deschide aplicația ta de SMS.
6. Trimite mesajul.

---
*Notă: Această aplicație nu procesează plăți direct. Ea doar compune mesajul SMS corect pe care utilizatorul îl trimite de pe propriul telefon către serviciul oficial de parcare din Cluj (7480).*
