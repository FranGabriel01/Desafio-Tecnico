# Desafío Técnico — Recomendador de Servicios

Aplicación web fullstack desarrollada para cotizar servicios de telecomunicaciones (Internet, TV y Combos). El sistema filtra las ofertas según la localidad del cliente y cuenta con un carrito de compras dinámico que aplica reglas de negocio en tiempo real.

---

## Tecnologías Utilizadas

- **Frontend:** Angular 21 (Standalone Components), TypeScript, CSS puro.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** MySQL.
- **Integraciones:** Consumo de la API pública de Georef (Gobierno de Argentina) para las localidades.

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/FranGabriel01/Desafio-Tecnico.git
cd Desafio-Tecnico
```

### 2. Base de Datos

Ejecutar el siguiente script SQL en MySQL para crear la base de datos y poblar las tablas:

```sql
CREATE DATABASE IF NOT EXISTS recomendador_personal;
USE recomendador_personal;

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disponibilidad ENUM('CABA', 'Resto Pais') NOT NULL,
  tipo ENUM('Tv','Internet','Combo') NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  precio_lista DECIMAL(10,2) NOT NULL,
  promo VARCHAR(50) NULL,
  id_promo VARCHAR(50) NULL,
  precio_final DECIMAL(10,2) NOT NULL,
  INDEX idx_tipo (tipo),
  INDEX idx_disponibilidad (disponibilidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE adicionales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_compatible ENUM('Tv','Internet') NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  precio_lista DECIMAL(10,2) NOT NULL,
  promo VARCHAR(50) NULL,
  id_promo VARCHAR(50) NULL,
  precio_final DECIMAL(10,2) NOT NULL,
  INDEX idx_tipo_compatible (tipo_compatible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO adicionales (tipo_compatible, nombre, precio_lista, promo, id_promo, precio_final) VALUES
('Tv', 'Fútbol', 22135.00, NULL, NULL, 22135.00),
('Tv', 'HBO', 11080.00, '3M X 50%', 'ADICIONAL_HBO', 5540.00),
('Tv', 'Universal', 10499.00, '3M X 100%', 'ADICIONAL_UNIVERSAL', 0.00),
('Tv', 'Paramount', 4635.00, '3M X 100%', 'ADICIONAL_PARAMOUNT', 0.00),
('Tv', 'Hot Pack', 11870.00, '3M X 50%', 'ADICIONAL_HOT_PACK', 5935.00),
('Internet', 'Extensor Wifi', 2500.00, NULL, NULL, 2500.00),
('Internet', 'Personal Fiber Security', 3298.00, NULL, NULL, 3298.00);

INSERT INTO productos (disponibilidad, tipo, nombre, precio_lista, promo, id_promo, precio_final) VALUES
('CABA', 'Internet', 'Internet 100 MB', 60000.00, '6M X 58%', 'VENTA_INTERNET_100', 24970.00),
('CABA', 'Internet', 'Internet 300 MB', 75260.00, '6M X 67%', 'VENTA_INTERNET_300', 24836.00),
('CABA', 'Internet', 'Internet 600 MB', 85000.00, '6M X 66%', 'VENTA_INTERNET_600', 29119.00),
('CABA', 'Internet', 'Internet 1000 MB', 95000.00, '6M X 63%', 'VENTA_INTERNET_1000', 35000.00),
('CABA', 'Tv', 'Flow Full con Deco', 50000.00, '6M X 60%', 'VENTA_TV_FLOW', 20000.00),
('CABA', 'Tv', 'Flow Full con Deco 4K', 60000.00, '6M X 62%', 'VENTA_TV_FLOW_4K', 22800.00),
('CABA', 'Combo', 'Flow Full con Deco + Internet 300 MB', 100000.00, '6M X 58%', 'VENTA_COMBO_1537', 42123.00),
('CABA', 'Combo', 'Flow Full con Deco + Internet 600 MB', 120000.00, '6M X 60%', 'VENTA_COMBO_1538', 48000.00),
('Resto Pais', 'Internet', 'Internet 100 MB', 60000.00, '6M X 58%', 'VENTA_INTERNET_100', 24970.00),
('Resto Pais', 'Internet', 'Internet 300 MB', 75260.00, '6M X 67%', 'VENTA_INTERNET_300', 24836.00),
('Resto Pais', 'Tv', 'Flow Full con Deco', 50000.00, '6M X 60%', 'VENTA_TV_FLOW', 20000.00),
('Resto Pais', 'Combo', 'Flow Full con Deco + Internet 300 MB', 100000.00, '6M X 58%', 'VENTA_COMBO_1537', 42123.00);
```

### 3. Backend

Abrir una terminal en la carpeta `Backend`:

```bash
npm install
```

Crear un archivo `.env` en la raíz del Backend con tus credenciales:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=recomendador_personal
PORT=3001
```

Iniciar el servidor:

```bash
npm run dev
```

### 4. Frontend

Abrir una terminal en la carpeta `Frontend`:

```bash
npm install
ng serve
```

La aplicación estará disponible en **http://localhost:4200**.

---

## Funcionalidades Principales

### Gestión Geográfica
- Selector de localidades integrado con API externa (datos.gob.ar).
- Filtrado automático de ofertas según disponibilidad (CABA o Resto del País).

### Catálogo de Ofertas
- Visualización en solapas (Combos, TV, Internet).
- Desplegable de adicionales compatibles según el tipo de producto.

### Carrito de Compras Inteligente
- **Reglas de negocio:** Impide duplicados y valida que no se agreguen servicios incompatibles (ej. dos servicios de Internet a la vez).
- **Auto-Combo:** Si el usuario elige TV e Internet por separado, el sistema sugiere y unifica automáticamente la oferta en un "Combo".
- **Cálculos en tiempo real:** Suma de la "Primera Factura" y cálculo del "Ahorro Total".
- **Persistencia:** Los datos del carrito se guardan en el navegador (localStorage).

---

## Prácticas Aplicadas

- **Seguridad:** Uso de consultas SQL parametrizadas para evitar inyecciones SQL.
- **Rendimiento:** Implementación de caché en memoria en el backend para la carga de localidades, evitando saturar la API externa.
- **Código Limpio:** Separación de responsabilidades en Angular (componentes visuales vs. lógica de negocio) y controladores independientes en Node.js.
- **Experiencia de Usuario (UX):** Alertas no bloqueantes (Toasts), modales de confirmación personalizados y soporte para Modo Oscuro.

---



**Franco Gabriel** — [GitHub](https://github.com/FranGabriel01/Desafio-Tecnico)


<img width="2560" height="1392" alt="Sin título6" src="https://github.com/user-attachments/assets/248dd660-39fb-4424-a8dc-3ef50d60f0ca" />
<img width="2560" height="1392" alt="Sin título5" src="https://github.com/user-attachments/assets/f0b1044b-0004-41ed-930c-fa48075e3b39" />
<img width="2560" height="1392" alt="Sin título4" src="https://github.com/user-attachments/assets/290344cd-7e03-4d83-8640-9994de6c2f22" />
<img width="2560" height="1392" alt="Sin título3" src="https://github.com/user-attachments/assets/2080d649-03b7-4c11-af03-51eadf15b546" />
<img width="2560" height="1392" alt="VistaCombo" src="https://github.com/user-attachments/assets/789489dc-3245-41a4-bf2f-11b410632517" />
<img width="2560" height="1392" alt="Vista" src="https://github.com/user-attachments/assets/b60fc96c-4c69-4e4c-a13c-b637588c799d" />



