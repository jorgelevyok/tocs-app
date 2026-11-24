# TOCs

TOCs registra acciones cotidianas con la fecha y la hora del momento. Sirve para salir de la duda: si la llave de gas quedó cerrada, si la puerta se cerró o si las plantas se regaron. Un toque guarda la confirmación. Si hace falta, se le puede sumar una nota, una foto o un audio.

El nombre visible de la app es **TOCs**. El proyecto de Expo se llama `tocs-app`.

## Introducción

- Objetivo: dejar un registro local, con hora, de acciones que uno suele volver a chequear.
- Tecnologías: React Native, Expo SDK 58, Expo Router, TypeScript y AsyncStorage.
- La app funciona sin conexión. No hay cuenta ni servidor.

## Requisitos

- Node.js 20 o superior
- npm
- Expo Go compatible con el SDK 58, o un emulador Android
- Para el APK: una cuenta de Expo y EAS CLI, o Android SDK si se genera en la máquina

## Dependencias principales

| Librería | Para qué se usa |
| --- | --- |
| expo, react-native | App nativa |
| expo-router | Stack, Tabs y Drawer por archivos |
| @react-navigation/drawer | Drawer real |
| @react-native-async-storage/async-storage | TOCs, confirmaciones y apariencia |
| expo-file-system | Copia fotos y audios al almacenamiento de la app |
| expo-image-picker | Imagen de la tarjeta y foto de un registro, desde la galería |
| expo-audio | Nota de voz y reproducción |
| expo-image | Vista previa de fotos y del logo |
| expo-symbols | Íconos del catálogo y de la interfaz |
| react-native-gesture-handler, react-native-reanimated | Gestos del drawer y la pulsación |
| typescript, eslint, tsx | Chequeo de tipos, lint y pruebas del dominio |

## Instalación

```bash
git clone <url-del-repositorio>
cd tocs-app
npm install
```

El repositorio local usa `master` como rama principal. Al momento de esta entrega todavía no hay un remoto de GitHub configurado en esta máquina.

## Ejecución

```bash
npx expo start
```

Desde esa pantalla se abre el emulador Android o Expo Go. La pestaña inicial es Inicio.

## Pruebas

Pruebas automáticas del calendario local, el historial y la lectura de AsyncStorage:

```bash
npm test
npx tsc --noEmit
npx expo lint
```

`npm test` no abre el emulador. Cubre que dos confirmaciones del mismo día queden separadas, que el filtro deje un solo TOC, que un JSON inválido no se interprete como lista vacía y que Deshacer quite una sola confirmación.

### Prueba manual en Android

1. Abrí la app. Tiene que verse Inicio, no el estado vacío, si ya hay datos guardados.
2. Sin TOCs: «No tienes TOCs configurados» y «Crear mi primer TOC».
3. Creá tres TOCs de prueba: «Cerré la llave de gas» con ícono, «Cerré la puerta» con una foto de la galería y «Regué las plantas» sin imagen.
4. Un toque corto en una tarjeta muestra «Registro guardado» y la hora de ahora. «Deshacer» borra solo ese registro.
5. Mantené presionada otra tarjeta. Tiene que crearse un solo registro y abrirse el modal. Agregá nota, audio o foto, reproducí el audio, mirá la foto y tocá «Listo».
6. Cerrá el modal sin «Listo» en otro registro: la confirmación queda, sin los detalles que no se guardaron.
7. Si cancelás la galería o negás el micrófono, el registro no se pierde.
8. El reloj de la tarjeta abre Historial con ese TOC elegido y no crea un registro.
9. En Historial, «Todos los TOCs» muestra los días de la más reciente a la más antigua. Dos confirmaciones del mismo TOC el mismo día son filas distintas.
10. En Ajustes elegí Oscuro, cerrá la app y volvé a abrirla. El tema y los registros siguen ahí, también sin internet.

## Arquitectura

```text
src/app/_layout.tsx                  Stack raíz, tema y datos
src/app/(drawer)/_layout.tsx         Drawer
src/app/(drawer)/(tabs)/             Inicio, Historial y Ajustes
src/app/toc/nuevo.tsx                Alta
src/app/toc/editar/[id].tsx          Edición, conserva id e historial
src/components/                      Tarjetas, formulario, modal, barra, campos
src/state/                           Tema y TOCs
src/domain/                          Fechas, historial, AsyncStorage y archivos
```

La barra inferior está en las tres pestañas. Nuevo TOC y Editar TOC viven en el Stack, fuera de las tabs. El menú de Inicio abre el drawer, con Inicio y Nuevo TOC.

El día del historial se calcula con el calendario local del dispositivo. No se usa `toISOString()` para agrupar, porque en Argentina (UTC-3) eso puede correr el registro al día anterior.

## APIs y endpoints

El flujo principal no llama a ninguna API. Los TOCs, las confirmaciones y la apariencia quedan en el dispositivo para que la app siga usable sin red.

La cursada practica `fetch` en la actividad de APIs, con GET y POST a JSONPlaceholder, en el proyecto `app-api-implementation`. Ese consumo no se mezcló acá: una llamada de red obligatoria contradice el requisito de usar la app offline.

## Lógica del negocio

- Un TOC tiene nombre obligatorio y una apariencia: ícono de catálogo, imagen de galería o ninguna.
- La imagen de la tarjeta y la foto de una confirmación se guardan en carpetas distintas (`tocs-covers`, `tocs-photos`). El audio va a `tocs-audio`.
- Un toque corto crea una confirmación con la hora actual.
- Una pulsación larga crea una sola confirmación y abre el modal. El toque corto no se dispara junto con la pulsación.
- «Listo» escribe la nota, el audio y la foto en esa misma confirmación. Cerrar el modal no borra la hora ya guardada.
- Deshacer elimina únicamente la confirmación del aviso «Registro guardado».
- Editar cambia el nombre y la apariencia, y deja el mismo `id` y las confirmaciones.
- Historial agrupa por día local, de la más nueva a la más vieja, y puede filtrar por un TOC.
- Las ilustraciones de la mascota tienen un espacio reservado. Hasta que no estén los archivos, ese espacio queda vacío. El logo `assets/images/tocs-logo.png` sí se muestra en el encabezado.

## Temas y estilos

Los colores salen de un tema compartido en `src/state/theme.tsx`.

| Token | Claro | Oscuro |
| --- | --- | --- |
| Fondo | `#F8F8F5` | `#111C1A` |
| Texto | `#16201E` | `#F4F7F5` |
| Verde | `#006B5B` | `#1F8F78` |
| Menta | `#DDF1E9` | `#1A3F36` |

Ajustes ofrece solo Apariencia: Claro, Oscuro y Sistema. La elección se aplica a toda la app y se vuelve a leer al abrir. Tarjetas, botones, campos, filas del historial y la barra inferior usan esos tokens.

En la Clase 7 el tema se armó con React Native Paper. Acá el tema es propio para respetar la paleta de los mockups, con la misma idea: una fuente de colores y componentes que la consumen.

## Persistencia

AsyncStorage guarda dos claves:

- `tocs.data.v1`: TOCs y confirmaciones, incluidas las rutas de foto y audio.
- `tocs.appearance.v1`: `light`, `dark` o `system`.

La app no escribe el estado vacío al arrancar. Primero lee. Si la lectura falla o el JSON no tiene la forma esperada, no pisa lo que ya estaba guardado.

Las fotos y los audios se copian al directorio de documentos. En AsyncStorage queda la referencia, no el archivo binario.

## Testing

- `npm test`: fechas en español, agrupación, filtro, parser y Deshacer.
- `npx tsc --noEmit` y `npx expo lint`, ambos sin errores en esta máquina.
- En el emulador Android (Pixel 7, Expo Go del SDK 58) se recorrió el flujo principal. El detalle está en «Estado de la entrega».

## Builds y despliegue

`eas.json` define el perfil `preview`, que genera un APK instalable:

```bash
npx eas-cli@latest build -p android --profile preview
```

Hace falta haber iniciado sesión en Expo (`npx eas-cli@latest login`). En esta máquina el APK todavía no se generó: no había una sesión de EAS activa para lanzar el build.

## Dónde se aplica cada tema de la cursada

El workspace no incluye un temario único del curso. Esto es lo que se pudo contrastar con los proyectos de la carpeta y con los PDF del Trabajo Integrador Final y de la Clase 14. Si hubo clases que no quedaron en un proyecto ni en esos PDF, no se pudieron contrastar.

| Tema que sí está en el workspace | Dónde queda en TOCs |
| --- | --- |
| Clase 2. Componentes, Expo y una primera app (`mi-primera-app-react-native`) | Pantallas, `StyleSheet` y el arranque con Expo |
| Actividad 2. Stack, Tabs, navegación anidada, `route.params` y hooks (`app-navigation`) | `src/app`: Stack raíz, Tabs y el `id` de Editar TOC. El drawer se abre con `useNavigation` |
| Drawer, además del Stack y las Tabs (pedido del TIF y de la Clase 14) | `src/app/(drawer)` , abierto desde el menú de Inicio |
| Clase 5. Listas, modal y `fetch` (`app-api-implementation`) | `FlatList` en Inicio, `SectionList` en Historial y el modal de registro. `fetch` no entra en el flujo, porque la app tiene que funcionar offline |
| Actividad 6. Permisos, cámara o galería y archivos (`app-native-permissions`) | Galería, micrófono y copia de archivos con `expo-file-system`. Si se niega el permiso, el registro ya creado se conserva |
| Clase 7. Theming (`app-brand-palette`) | Claro, Oscuro y Sistema, con tokens compartidos |
| AsyncStorage, visto en la primera app y pedido por el TIF | `src/state/theme.tsx` y `src/state/tocs.tsx` |
| `useMemo` y `useCallback` (bibliografía del TIF) | El historial agrupado usa `useMemo`. Las altas, los registros y el tema usan `useCallback` |
| Clase 14. README, APK, capturas, pitch y demo | Este archivo, `eas.json` y la sección de pitch |

No apareció en el workspace, y por eso no se puede marcar como cubierto o faltante con un nombre de clase: testing automatizado de interfaz, autenticación, mapas, notificaciones push ni animaciones avanzadas. El PDF del TIF pide que los temas de la cursada estén explicados en el README. Esta tabla es esa explicación con lo que el workspace permite contrastar.

## Pitch

### Problema

Hay acciones chicas que, un rato después, no se recuerdan con seguridad: la llave de gas, la puerta, el riego. Volver a chequearlas lleva tiempo y no deja ningún rastro de la vez anterior.

### Solución

TOCs guarda esa confirmación con la hora local en un toque. Si la persona quiere, agrega una nota, una foto o un audio. El historial muestra cada vez por separado.

### Demo funcional

Datos ficticios, en este orden, en el emulador o en un dispositivo:

1. Estado vacío y «Crear mi primer TOC».
2. «Cerré la llave de gas» con el ícono de llama.
3. «Cerré la puerta» con una imagen de la galería.
4. «Regué las plantas» sin imagen.
5. Toque corto, «Deshacer» y otro toque corto.
6. Pulsación larga, nota «Antes de salir» y, si el dispositivo lo permite, audio y foto.
7. Reloj de la tarjeta, filtro «Todos los TOCs» y Ajustes en Oscuro.
8. Cerrar y abrir: los datos y el tema siguen, sin internet.

Si el entorno falla el día de la presentación, el plan B es el video mudo `docs/demo/respaldo.mp4`. Es una captura de unos 16 segundos del emulador, con Historial en pantalla y el audio de un registro en reproducción. No reemplaza el pitch hablado.

### Detalles técnicos

Expo Router con Stack, Tabs y Drawer. AsyncStorage para los datos y el tema. Archivos locales para fotos y audios. Tema claro, oscuro y de sistema. Fechas con `Intl` en `es-AR` y el calendario local.

### Aprendizajes

Separar la hora del registro de los detalles opcionales evita perder la confirmación si la persona cierra el modal, cancela la galería o niega el micrófono. Leer AsyncStorage antes de mostrar el estado vacío evita pisar datos al abrir la app.

### Futuro

Faltan las ilustraciones finales, el pitch hablado y el APK. El enlace de GitHub tampoco está: el repo local sigue en `master` y no tiene remoto. También se puede sumar borrar un TOC y editar los detalles de un registro ya cerrado.

## Estado de la entrega

| Pedido de la Clase 14 y del TIF | Estado |
| --- | --- |
| Código en GitHub | Pendiente. Esta copia está en `master`, sin remoto. `gh` no está instalado en esta máquina |
| README | Este archivo |
| APK instalable | Pendiente. `eas.json` ya tiene el perfil `preview`. Falta `eas login` y el build |
| Capturas de la app funcionando | En `docs/capturas/`, tomadas en el emulador |
| Video de respaldo | `docs/demo/respaldo.mp4`, captura muda del emulador. El pitch hablado sigue pendiente |
| Navegación Stack, Tabs y Drawer | Implementada y vista en el emulador: tres tabs, Nuevo TOC en el Stack y el drawer desde el menú |
| AsyncStorage | Implementado. Tras cerrar Expo Go a la fuerza, volvieron los TOCs, la nota, la foto, el audio y el tema |
| Theming y componentes reutilizables | Implementados. Oscuro quedó seleccionado al reabrir |
| TypeScript y lint | `npx tsc --noEmit` y `npx expo lint`, sin errores |
| Pruebas de dominio | `npm test`, 7 pruebas, todas verdes |
| Demo en emulador | Hecha en Pixel 7 con Expo Go 58. Ver la nota de abajo |

### Qué se comprobó en el emulador

El 24 de noviembre de 2026, con la app en español de Argentina y la hora local del emulador:

- Inicio vacío: «No tienes TOCs configurados» y «Crear mi primer TOC».
- Un TOC con ícono, otro sin imagen y otro con una foto de la galería.
- Toque corto, aviso «Registro guardado» y «Deshacer», que volvió a «Sin registros».
- Pulsación larga: un solo registro, sin el aviso de Deshacer, y el modal encima de Inicio.
- Nota «Antes de salir» y, en otro registro, nota «Foto de la puerta», audio y foto. El audio se reprodujo desde Historial (el control pasó a pausa y la barra avanzó). La foto se ve en el modal y en el historial.
- Dos confirmaciones del mismo TOC, el mismo día y a la misma hora, como filas distintas.
- El reloj abre Historial con ese TOC y no crea un registro.
- El filtro muestra un TOC y oculta los demás. La fecha se lee «Hoy, 24 de noviembre».
- Apariencia Oscuro sigue en `checked` después de cerrar la app.

Quedó sin probar en el dispositivo: cancelar el selector de la galería y negar el permiso del micrófono. El código deja el registro en ambos casos, pero esa rama no se ejecutó en el emulador. Tampoco se borró un TOC de prueba que quedó con el nombre de una URL, porque la app no tiene baja de TOCs. Algunas capturas de Inicio lo muestran. Conviene limpiar los datos de Expo Go antes del pitch en vivo.

Las ilustraciones de la mascota siguen vacías a propósito, hasta que estén los archivos finales. El logo sí se muestra.

## Bibliografía

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Crear un build con EAS](https://docs.expo.dev/build/introduction/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Repositorios en GitHub](https://docs.github.com/en/repositories)
- [Using Fetch — Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [Guide to useMemo and useCallback — Kent C. Dodds](https://kentcdodds.com/blog/usememo-and-usecallback)
- [Learn React Native — Codecademy](https://www.codecademy.com/learn/learn-react-native)
