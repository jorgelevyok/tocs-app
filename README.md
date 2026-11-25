# TOCs

## Introducción

TOCs registra acciones cotidianas con la fecha y la hora del momento. Sirve para salir de la duda: si la llave de gas quedó cerrada, si la puerta se cerró o si las plantas se regaron. Un toque guarda la confirmación. Si hace falta, se le puede sumar una nota, una foto o un audio.

El nombre visible de la app es **TOCs**. El proyecto de Expo se llama `tocs-app`.

- Objetivo: dejar un registro local, con hora, de acciones que uno suele volver a chequear.
- Tecnologías: React Native, Expo SDK 58, Expo Router, TypeScript y AsyncStorage.
- La app funciona sin conexión. No hay cuenta ni servidor.

## Instalación

Hace falta Node.js 20 o superior, npm y Expo Go compatible con el SDK 58, o un emulador Android.

```bash
git clone https://github.com/jorgelevyok/tocs-app.git
cd tocs-app
npm install
npx expo start
```

El repositorio está en [github.com/jorgelevyok/tocs-app](https://github.com/jorgelevyok/tocs-app). La rama principal es `master`. Desde la pantalla de Expo se abre el emulador Android o Expo Go. La pestaña inicial es Inicio.

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

La barra inferior está en las tres pestañas. Nuevo TOC y Editar TOC viven en el Stack, fuera de las tabs. El Drawer envuelve las pestañas. En Inicio, el botón de menú de la izquierda lo abre. También se abre deslizando desde el borde izquierdo. El panel muestra Inicio, Historial y Ajustes, y cada uno abre esa pestaña.

El día del historial se calcula con el calendario local del dispositivo. No se usa `toISOString()` para agrupar, porque en Argentina (UTC-3) eso puede correr el registro al día anterior.

## APIs y endpoints

El flujo principal no llama a ninguna API. Los TOCs, las confirmaciones y la apariencia quedan en el dispositivo para que la app siga usable sin red.

## Lógica del negocio

- Un TOC tiene nombre obligatorio y una apariencia: ícono de catálogo, imagen de galería o ninguna.
- La imagen de la tarjeta y la foto de una confirmación se guardan en carpetas distintas (`tocs-covers`, `tocs-photos`). El audio va a `tocs-audio`.
- Un toque corto crea una confirmación con la hora actual.
- Una pulsación larga crea una sola confirmación y abre el modal. El toque corto no se dispara junto con la pulsación.
- «Listo» escribe la nota, el audio y la foto en esa misma confirmación. Cerrar el modal no borra la hora ya guardada.
- Deshacer elimina únicamente la confirmación del aviso «Registro guardado».
- Editar cambia el nombre y la apariencia, y deja el mismo `id` y las confirmaciones.
- Borrar un TOC se hace desde el modal de registro. Se puede borrar solo el TOC, y el historial conserva el nombre, o borrar el TOC junto con sus registros.
- En Historial se puede borrar un registro, los de un día o todos los de un TOC.
- Historial agrupa por día local, de la más nueva a la más vieja, y puede filtrar por un TOC.

## Temas y estilos

Los colores salen de un tema compartido en `src/state/theme.tsx`.

| Token | Claro     | Oscuro    |
| ----- | --------- | --------- |
| Fondo | `#F8F8F5` | `#111C1A` |
| Texto | `#16201E` | `#F4F7F5` |
| Verde | `#006B5B` | `#1F8F78` |
| Menta | `#DDF1E9` | `#1A3F36` |

Ajustes ofrece solo Apariencia: Claro, Oscuro y Sistema. La elección se aplica a toda la app y se vuelve a leer al abrir. Tarjetas, botones, campos, filas del historial y la barra inferior usan esos tokens.

## Persistencia

AsyncStorage guarda dos claves:

- `tocs.data.v1`: TOCs y confirmaciones, incluidas las rutas de foto y audio.
- `tocs.appearance.v1`: `light`, `dark` o `system`.

La app no escribe el estado vacío al arrancar. Primero lee. Si la lectura falla o el JSON no tiene la forma esperada, no pisa lo que ya estaba guardado.

Las fotos y los audios se copian al directorio de documentos. En AsyncStorage queda la referencia, no el archivo binario.

## Testing

Herramientas: `tsx` para las pruebas del dominio, `tsc` para los tipos y ESLint con `npx expo lint`.

```bash
npm test
npx tsc --noEmit
npx expo lint
```

`npm test` no abre el emulador. Cubre fechas en español, que dos confirmaciones del mismo día queden separadas, que el filtro deje un solo TOC, que un JSON inválido no se interprete como lista vacía y que Deshacer quite una sola confirmación.

En el emulador Android (Pixel 7, Expo Go del SDK 58) se recorrió el flujo principal: alta con ícono, sin imagen y con foto, toque corto, Deshacer, pulsación larga con nota, audio y foto, filtro del historial y Apariencia Oscuro después de cerrar la app.

## Builds y despliegue

`eas.json` define el perfil `preview`, de distribución interna, que genera un APK:

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

El APK de esta entrega está en [expo.dev/accounts/jorgelevyok/projects/tocs-app/builds/ec572739-da5f-4e85-aef9-6dee049af0ac](https://expo.dev/accounts/jorgelevyok/projects/tocs-app/builds/ec572739-da5f-4e85-aef9-6dee049af0ac).

## Dependencias principales

| Librería                                              | Para qué se usa                                              |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| expo, react-native                                    | App nativa                                                   |
| expo-router                                           | Stack, Tabs y Drawer por archivos                            |
| @react-navigation/drawer                              | Drawer real                                                  |
| @react-native-async-storage/async-storage             | TOCs, confirmaciones y apariencia                            |
| expo-file-system                                      | Copia fotos y audios al almacenamiento de la app             |
| expo-image-picker                                     | Imagen de la tarjeta y foto de un registro, desde la galería |
| expo-audio                                            | Nota de voz y reproducción                                   |
| expo-image                                            | Vista previa de fotos y del logo                             |
| expo-symbols                                          | Íconos del catálogo y de la interfaz                         |
| react-native-gesture-handler, react-native-reanimated | Gestos del drawer y la pulsación                             |
| typescript, eslint, tsx                               | Chequeo de tipos, lint y pruebas del dominio                 |

## Temas de la cursada

### Componentes, props y StyleSheet

Las pantallas arman la interfaz con componentes de `src/components/`. `TocCard`, `PrimaryButton` y `TextField` reciben lo que tienen que mostrar por props. Los estilos de cada uno están en un `StyleSheet.create` al final del archivo, y los colores llegan del tema.

### Flexbox

El layout es Flexbox. `Screen` ocupa la pantalla con `flex: 1`. El encabezado y las filas usan `flexDirection: "row"`. Las listas dejan espacio abajo para la barra de pestañas con `paddingBottom`.

### Estado, eventos y TextInput

El nombre del TOC, la nota y los errores viven en `useState`. Un toque en la tarjeta llama a `onRegister`. Una pulsación larga llama a `onRegisterWithDetails`. `TextField` envuelve `TextInput` y avisa cada cambio con `onChangeText`. Se usa en el alta, la edición y la nota del registro.

### Listas

Inicio muestra los TOCs con `FlatList` en `src/app/(drawer)/(tabs)/index.tsx`. Historial agrupa los días con `SectionList` en `src/app/(drawer)/(tabs)/historial.tsx`: cada día es una sección y cada confirmación es una fila.

### Navegación: parámetros, push y goBack

El botón de menú de Inicio abre el Drawer con `DrawerActions.openDrawer` en `src/components/AppHeader.tsx`. El panel está en `src/app/(drawer)/_layout.tsx` y su contenido en `src/components/AppDrawerContent.tsx`: Inicio, Historial y Ajustes hacen `navigate` a cada pestaña. El botón **+** y «Crear mi primer TOC» también hacen `push` a `/toc/nuevo`. Editar hace `push` a `/toc/editar/[id]`. Esa pantalla lee el `id` con `useLocalSearchParams` y, al guardar, vuelve con `goBack` en `src/lib/navigation.ts`. El reloj de la tarjeta abre Historial con `navigate`.

### Formularios

`TocForm` es el formulario de alta y de edición: nombre obligatorio, ícono, imagen o sin imagen, mensaje de error y botón de guardar. El registro usa otro formulario dentro del modal, con nota, audio y foto. `KeyboardAvoidingView` sube la hoja cuando se escribe la nota.

### APIs y fetch

No hay `fetch`. Un TOC tiene que poder guardarse sin internet, así que la lista no sale de un servidor. La lectura y la escritura pasan por AsyncStorage.

### Permisos, cámara, galería y archivos

`TocForm` pide permiso de cámara antes de `launchCameraAsync` y abre la galería con `launchImageLibraryAsync`. Si el permiso se niega, el formulario muestra el error y no pierde el nombre ya escrito. El modal de registro pide el micrófono para la nota de voz y la galería para la foto. `src/domain/media.ts` copia esos archivos a `tocs-covers`, `tocs-photos` y `tocs-audio`. Cuando la copia queda hecha, borra el temporal de la caché.

### useMemo y useCallback

Inicio ordena las tarjetas con `useMemo`, para no reordenar en cada render. Historial arma los grupos y las secciones del `SectionList` con `useMemo`. Crear un TOC, registrar, borrar y cambiar el tema usan `useCallback` en `src/state/tocs.tsx` y `src/state/theme.tsx`.

### Documentación, pitch y APK

Este README es la documentación. Las imágenes y los videos de la entrega están en `docs/`, tomados en el emulador Android (Pixel 7, Expo Go del SDK 58). El APK está en [expo.dev/accounts/jorgelevyok/projects/tocs-app/builds/ec572739-da5f-4e85-aef9-6dee049af0ac](https://expo.dev/accounts/jorgelevyok/projects/tocs-app/builds/ec572739-da5f-4e85-aef9-6dee049af0ac).

`docs/capturas/` tiene doce capturas, en el orden del flujo:

| Archivo | Qué muestra |
| --- | --- |
| `01-vacio.png` | Inicio sin TOCs |
| `02-nuevo.png` | Alta de «Cerre la llave de gas», con el ícono de llama |
| `03-icono.png` | La tarjeta en Inicio, todavía sin registros |
| `04-toque-corto.png` | Toque corto y el aviso «Registro guardado» |
| `05-deshacer.png` | Después de Deshacer, otra vez sin registros |
| `06-pulsacion-larga.png` | Modal de la pulsación larga, con la nota «Antes de salir» |
| `07-historial.png` | Ese registro en Historial, el 25 de noviembre |
| `08-filtro.png` | Filtro del historial, con «Todos los TOCs» y «Cerre la llave de gas» |
| `09-ajustes.png` | Apariencia en Claro |
| `10-oscuro.png` | Apariencia en Oscuro |
| `11-inicio-oscuro.png` | Inicio en oscuro, con el registro del día |
| `12-drawer.png` | Drawer con Inicio, Historial y Ajustes |

`docs/demo/` tiene dos videos del mismo recorrido:

- [`demo.mp4`](docs/demo/demo.mp4) (1 min 27 s): grabación continua de la app.
- [`guided-demo.mp4`](docs/demo/guided-demo.mp4) (4 min 23 s): la demo guiada, para la presentación.
