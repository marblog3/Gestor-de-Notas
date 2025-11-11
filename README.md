

-----

# Gestor de Notas E.E.S.T.N°5

Un sistema web integral para la administración de calificaciones, usuarios y asignaciones académicas, diseñado para la E.E.S.T.N°5.

## 📚 Descripción

El **Gestor de Notas** es una aplicación web full-stack diseñada para reemplazar el sistema tradicional de planillas en papel. El sistema centraliza la información en una base de datos MySQL y provee interfaces de usuario diferenciadas para los cuatro roles clave de la institución:

  * **Administrador:** Tiene control total sobre el sistema, incluyendo la aprobación de nuevos usuarios, la gestión de perfiles, la creación de materias y la asignación de cursos y preceptores.
  * **Preceptor:** Administra la asignación de alumnos a sus cursos correspondientes y puede visualizar el estado académico de los estudiantes a su cargo.
  * **Profesor:** Accede a sus planillas de calificaciones digitales, carga notas parciales y de intensificación, calcula promedios automáticamente y puede exportar sus planillas a Excel.
  * **Alumno:** Consulta su "Boletín del Alumno" digital en tiempo real, donde puede ver sus calificaciones, notas finales y observaciones. También puede exportar su boletín.

## 🛠️ Stack de Tecnologías

Este proyecto fue construido utilizando un stack de tecnologías web clásico, enfocado en la robustez y la seguridad:

  * **Frontend:** HTML5, CSS3, JavaScript (ES6+).
  * **Backend (API):** PHP 8 (utilizando **PDO** para conexiones seguras a la base de datos).
  * **Base de Datos:** MySQL (MariaDB).
  * **Intercambio de Datos:** JSON (para la comunicación asíncrona entre el cliente JS y la API de PHP).

Se eligió esta arquitectura por su fiabilidad, amplia documentación y facilidad de despliegue en entornos de hosting comunes (y para desarrollo local con XAMPP), permitiendo un desarrollo full-stack cohesivo y seguro.

## 🚀 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en un entorno de desarrollo local (como XAMPP).

### Prerrequisitos

Asegúrate de tener instalado un servidor web local compatible con PHP y MySQL.

  * **XAMPP** (Recomendado): [https://www.apachefriends.org/es/index.html](https://www.apachefriends.org/es/index.html)

### Pasos

1.  **Clonar el Repositorio:**

    ```bash
    git clone https://github.com/marblog3/Gestor-de-Notas.git
    ```

    O descarga el ZIP y descomprímelo.

2.  **Mover Archivos del Proyecto:**

      * Mueve la carpeta completa del proyecto (ej. `gestor-de-notas`) al directorio `htdocs` de tu instalación de XAMPP.
      * (Ej. `C:/xampp/htdocs/gestor-de-notas`)

3.  **Configurar la Base de Datos:**

      * Inicia los módulos de **Apache** y **MySQL** desde el panel de control de XAMPP.
      * Abre tu navegador y ve a `http://localhost/phpmyadmin/`.
      * Crea una nueva base de datos llamada: **`sistema_gestion_eest5`**.
      * Selecciona la base de datos recién creada.
      * Haz clic en la pestaña "Importar".
      * Selecciona el archivo **`sistema_gestion_eest5.sql`** (ubicado en la raíz de este proyecto) y haz clic en "Continuar".

4.  **Verificar la Configuración:**

      * Asegúrate de que la configuración en `api/db_config.php` coincida con la de tu servidor MySQL. Por defecto, está configurado para:
          * `DB_HOST`: 'localhost'
          * `DB_NAME`: 'sistema\_gestion\_eest5'
          * `DB_USER`: 'root'
          * `DB_PASS`: '' (vacío)

5.  **Acceder a la Aplicación:**

      * ¡Listo\! Abre la aplicación desde tu navegador en:
      * `http://localhost/gestor-de-notas/html/principal.html`

## 📂 Estructura del Proyecto

```
gestor-de-notas/
┣ 📂 .vscode/       (Configuración del editor)
┣ 📂 api/           (Backend: Lógica de PHP, endpoints y conexión a BD)
┣ 📂 css/           (Hojas de estilo: base.css, admin.css, profesor.css, etc.)
┣ 📂 html/          (Vistas: admin.html, profesor.html, alumno.html, etc.)
┣ 📂 img/           (Recursos gráficos, ej: logo.png)
┣ 📂 js/            (Frontend: Lógica JS por rol: admin.js, profesor.js, etc.)
┣ 📜 README.md       (Esta documentación)
┗ 📜 sistema_gestion_eest5.sql (Script de la Base de Datos)
```

## 👨‍💻 Autores

Desarrollado por estudiantes de 7° 4° de Informática como parte del proyecto final de "Evaluación de Proyecto".

  * **Benitez, Maria** 
  * **Gomez, Kevin** 
  * **Abaca, Lucia** 


**E.E.S.T. N°5 "General Manuel N. Savio"**
Ciclo Lectivo 2025