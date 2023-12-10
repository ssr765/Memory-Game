<p align="center"><a href="https://ssr765.github.io/Memory-Game/" target="_blank"><img src="https://ssr765.github.io/Memory-Game/assets/simplelogo.png" width="200"></a></p>
<p align="center"><img src="https://img.shields.io/github/license/ssr765/Memory-Game"></p>

# Memory game
Mi primer proyecto de JavaScript, una versión hecha por mí del clásico juego Memory.
Este proyecto está programado en JavaScript puro, salvo por el uso de la librería FileSaver para
poder descargar archivos generados por el propio código JavaScript.
## Temáticas personalizadas
Las temáticas personalizadas son archivos de texto plano (txt) que contienen 12 URL a imágenes para las fichas del juego 
y una decimotercera URL opcional para el fondo. Estos archivos se pueden generar manualmente, o exportando un tema al
poner imágenes personalizadas en el juego.
## Imágenes generadas por IA
Las imágenes del juego han sido generadas con inteligencia artificial a partir del modelo [Stable Diffusion XL 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/sd_xl_base_1.0.safetensors) junto a [Stable Diffusion XL 1.0-refiner](https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/blob/main/sd_xl_refiner_1.0.safetensors) y [Stable Diffusion XL 1.0 Example LoRA](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/sd_xl_offset_example-lora_1.0.safetensors).