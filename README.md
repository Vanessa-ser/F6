NoteFlow
  NoteFlow es una aplicación móvil de productividad desarrollada con Expo y React Native, diseñada para la gestión eficiente de notas personales, listas de tareas y notas rápidas.

Descripción del Proyecto
  La aplicación permite a los usuarios organizar su día a día mediante una interfaz intuitiva basada en pestañas. NoteFlow ha sido desarrollada siguiendo una arquitectura escalable, utilizando Zustand para la gestión de estado global y FlashList para garantizar un rendimiento fluido.

Documentación del Proyecto: Puedes consultar la memoria técnica completa en la carpeta /docs.

Tecnologías Utilizadas
  -Framework: Expo (React Native)
  -Enrutamiento: Expo Router
  -Gestión de Estado: Zustand
  -Rendimiento: Shopify FlashList
  -Validación: Zod
  -Persistencia: AsyncStorage

Gestión del Proyecto
  El desarrollo se ha realizado siguiendo una metodología ágil. Puedes visualizar el estado de las tareas y la evolución del proyecto en nuestro tablero de Trello:

*Enlace Trello*

Instrucciones de Instalación
  Clonar el repositorio:
    Bash
    git clone https://github.com/vanessa-ser/F6.git

Instalar dependencias:
  Bash
    npm install

Iniciar el proyecto:
  Bash
    npx expo start

    
Estructura del Proyecto
  Plaintext
    app/          # Rutas y navegación (Expo Router)
    components/   # Componentes reutilizables
    constants/    # Temas y estilos
    docs/         # Documentación técnica
    store/        # Gestión de estado (Zustand)
    types/        # Definiciones de tipos (TypeScript)
