Para mantener la calidad, la coherencia y la mantenibilidad del código de NoteFlow, he apoyado parte del desarrollo en herramientas de IA como Cursor y Claude. La idea no es que la IA programe por mí, sino que cualquier código generado siga exactamente los estándares y la arquitectura del proyecto. También me ha ayudado en momentos de desajuste de codigo.

Definición de Estándares del Proyecto
    Antes de generar cualquier bloque de código, la IA debe seguir una guía técnica que define cómo debe estructurarse el proyecto. Entre las normas que establecí están:

        Stack tecnológico: TypeScript estricto, React Native, Expo Router y Zustand como tecnologías obligatorias.

        Arquitectura: Estructura de carpetas fija (app/, store/, components/) para mantener orden y separación de responsabilidades.

        Patrones de diseño: Uso de componentes funcionales, custom hooks para encapsular lógica compleja y evitar prop drilling gracias al estado global.

Contexto técnico para la IA (System Prompting)
Cuando utilizo Claude para ayudarme a resolver problemas más avanzados, le proporciono un contexto técnico estable para que sus respuestas estén alineadas con el proyecto:

Convenciones: Archivos en kebab-case, interfaces centralizadas en types/index.ts y tipado estricto en todas las funciones.

Rendimiento: Se le instruye para que cualquier lista que proponga use FlashList y calcule correctamente estimatedItemSize para asegurar un rendimiento óptimo.

Justificación
    El objetivo de esta configuración no es automatizar el desarrollo sin supervisión, sino garantizar que:

        -El código generado sea coherente con la arquitectura,
        -No introduzca deuda técnica,
        -Que mantenga un nivel profesional y escalable.

En resumen, la IA actúa como una herramienta de apoyo que trabaja bajo las mismas reglas que yo, asegurando que todo el proyecto mantenga un estándar alto.