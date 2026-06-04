Diferencia que hay entre React Native y una app nativa:

    React Native no funciona como una WebView ni renderiza HTML/CSS. Lo que hace es comunicarse con los hilos nativos mediante el JavaScript Bridge, enviando instrucciones al UI Thread para que renderice componentes nativos reales tanto en iOS como en Android.
    Esto permite tener rendimiento nativo sin tener que mantener dos bases de código distintas.

Expo Go vs. Development Build
    Expo Go: Perfecto para prototipos rápidos, pero muy limitado porque no permite usar módulos nativos personalizados.

    Development Build: Es un binario propio generado con EAS. En proyectos reales es imprescindible, ya que permite integrar librerías que requieren código nativo (cámara, sensores, notificaciones avanzadas, etc.).

Sistema de Diseño (Gluestack UI)
    Elegí Gluestack UI porque trabaja con un sistema de tokens y está construido sobre la filosofía de Tailwind, lo que lo hace muy flexible y escalable. A diferencia de librerías más rígidas como React Native Paper, Gluestack permite mantener una coherencia visual sin sacrificar rendimiento.

Navegación en NoteFlow
    La navegación de NoteFlow está organizada así:

        -Tabs: Para separar las tres áreas principales de la app (Notas, Tareas e Ideas).
        -Stack: Para manejar la navegación interna de cada sección (lista → detalle).
        -Modales: Para crear contenido nuevo sin mezclar el flujo del formulario con la navegación principal.

Gestión de Estado (Zustand)
    Zustand mejora mucho a Context API porque evita renders innecesarios gracias a los selectores.
    omparado con Redux, elimina casi todo el boilerplate, lo que hace que la gestión del estado global sea más limpia y directa. Además, con persist puedo guardar los datos en AsyncStorage sin complicaciones.

Rendimiento en listas (FlashList)
    FlatList funciona bien, pero en listas largas puede generar lag por cómo recicla las celdas.
    FlashList optimiza este proceso de forma mucho más agresiva, lo que mejora el rendimiento.
    La propiedad estimatedItemSize es clave para que el motor pueda calcular el layout por adelantado y evitar saltos o bloqueos.