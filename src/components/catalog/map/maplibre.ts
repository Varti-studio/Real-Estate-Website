import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// MapLibre resolves its worker next to its own module, which Vite's bundling
// breaks; let Vite bundle the worker (with its shared chunk) and pass the URL.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

setWorkerUrl(workerUrl)

export * from 'maplibre-gl'
